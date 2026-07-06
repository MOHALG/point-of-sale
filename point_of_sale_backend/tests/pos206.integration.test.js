const test = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const path = require('node:path');
const mongoose = require('mongoose');

require('dotenv').config();

const PORT = Number(process.env.PORT || 3000);
const API = process.env.API_BASE_URL || `http://localhost:${PORT}`;
const PASSWORD = process.env.TEST_PASSWORD || 'Smoke12345';
const ts = Date.now();
const prefix = `itest_pos206_${ts}`;
const SERVER_START_TIMEOUT_MS = Number(process.env.SERVER_START_TIMEOUT_MS || 60000);

let serverProcess = null;
let startedServer = false;
let serverStdout = '';
let serverStderr = '';

const users = {
	adminPrimary: `${prefix}_admin_primary`,
	adminSecondary: `${prefix}_admin_secondary`,
	manager: `${prefix}_manager`,
};

const tokens = {
	adminPrimary: null,
	adminSecondary: null,
	manager: null,
};

const userIds = {
	adminPrimary: null,
	adminSecondary: null,
	manager: null,
};

const createdIds = {
	cashier: null,
};

async function call(method, pathName, token, body) {
	const headers = { 'Content-Type': 'application/json' };
	if (token) headers.authorization = `Bearer ${token}`;

	const response = await fetch(`${API}${pathName}`, {
		method,
		headers,
		body: body ? JSON.stringify(body) : undefined,
	});

	let json = null;
	try {
		json = await response.json();
	} catch {
		json = null;
	}

	return {
		status: response.status,
		body: json,
	};
}

async function isServerUp() {
	try {
		await fetch(`${API}/auth/sign-in`, { method: 'OPTIONS' });
		return true;
	} catch {
		return false;
	}
}

async function waitForServer(timeoutMs = SERVER_START_TIMEOUT_MS) {
	const startedAt = Date.now();
	while (Date.now() - startedAt < timeoutMs) {
		if (serverProcess && serverProcess.exitCode !== null) {
			throw new Error(
				`Backend process exited early with code ${serverProcess.exitCode}. stderr: ${serverStderr.slice(-600) || '(empty)'}`
			);
		}

		if (await isServerUp()) return;
		await new Promise((resolve) => setTimeout(resolve, 300));
	}
	throw new Error(
		`Timed out waiting for backend server to start after ${timeoutMs}ms. stdout: ${serverStdout.slice(-600) || '(empty)'} stderr: ${serverStderr.slice(-600) || '(empty)'}`
	);
}

async function ensureServer() {
	if (await isServerUp()) return;

	const serverPath = path.resolve(__dirname, '..', 'server.js');
	serverProcess = spawn(process.execPath, [serverPath], {
		cwd: process.cwd(),
		stdio: 'pipe',
	});

	serverProcess.stdout.on('data', (chunk) => {
		serverStdout += chunk.toString();
		if (serverStdout.length > 12000) {
			serverStdout = serverStdout.slice(-12000);
		}
	});

	serverProcess.stderr.on('data', (chunk) => {
		serverStderr += chunk.toString();
		if (serverStderr.length > 12000) {
			serverStderr = serverStderr.slice(-12000);
		}
	});

	startedServer = true;
	await waitForServer();
}

test.before(async () => {
	await ensureServer();
	await mongoose.connect(process.env.MONGO_URI);

	const usersCol = mongoose.connection.collection('users');

	for (const username of Object.values(users)) {
		const signup = await call('POST', '/auth/sign-up', null, {
			username,
			password: PASSWORD,
		});
		assert.ok([201, 409].includes(signup.status), `Failed sign-up for ${username}`);
	}

	await usersCol.updateOne(
		{ username: users.adminPrimary },
		{ $set: { role: 'admin', assignedPos: null } }
	);
	await usersCol.updateOne(
		{ username: users.adminSecondary },
		{ $set: { role: 'admin', assignedPos: null } }
	);
	await usersCol.updateOne(
		{ username: users.manager },
		{ $set: { role: 'manager', assignedPos: null } }
	);

	for (const [key, username] of Object.entries(users)) {
		const signin = await call('POST', '/auth/sign-in', null, {
			username,
			password: PASSWORD,
		});
		assert.equal(signin.status, 200, `Sign-in failed for ${username}`);
		assert.ok(signin.body && signin.body.token, `Missing token for ${username}`);
		tokens[key] = signin.body.token;

		const dbUser = await usersCol.findOne({ username });
		assert.ok(dbUser, `Missing DB user for ${username}`);
		userIds[key] = String(dbUser._id);
	}
});

test('admin can create user', async () => {
	const create = await call('POST', '/admin/users', tokens.adminPrimary, {
		username: `${prefix}_cashier_created`,
		password: PASSWORD,
		role: 'cashier',
	});

	assert.equal(create.status, 201);
	assert.equal(create.body.username, `${prefix}_cashier_created`);
	assert.equal(create.body.role, 'cashier');
	assert.equal(create.body.hashedPassword, undefined);
	createdIds.cashier = String(create.body._id);
});

test('non-admin create is denied', async () => {
	const create = await call('POST', '/admin/users', tokens.manager, {
		username: `${prefix}_blocked_create`,
		password: PASSWORD,
		role: 'cashier',
	});

	assert.equal(create.status, 403);
});

test('create with missing data returns 400', async () => {
	const create = await call('POST', '/admin/users', tokens.adminPrimary, {
		username: `${prefix}_missing_password`,
	});

	assert.equal(create.status, 400);
});

test('invalid id returns 400 on get, update, and delete', async () => {
	const badId = 'not-an-object-id';

	const getResult = await call('GET', `/admin/users/${badId}`, tokens.adminPrimary);
	assert.equal(getResult.status, 400);

	const updateResult = await call('PUT', `/admin/users/${badId}`, tokens.adminPrimary, { role: 'manager' });
	assert.equal(updateResult.status, 400);

	const deleteResult = await call('DELETE', `/admin/users/${badId}`, tokens.adminPrimary);
	assert.equal(deleteResult.status, 400);
});

test('not found returns 404 on get, update, and delete', async () => {
	const missingId = new mongoose.Types.ObjectId().toString();

	const getResult = await call('GET', `/admin/users/${missingId}`, tokens.adminPrimary);
	assert.equal(getResult.status, 404);

	const updateResult = await call('PUT', `/admin/users/${missingId}`, tokens.adminPrimary, { role: 'manager' });
	assert.equal(updateResult.status, 404);

	const deleteResult = await call('DELETE', `/admin/users/${missingId}`, tokens.adminPrimary);
	assert.equal(deleteResult.status, 404);
});

test('self-delete is blocked', async () => {
	const result = await call('DELETE', `/admin/users/${userIds.adminPrimary}`, tokens.adminPrimary);
	assert.equal(result.status, 400);
	assert.equal(result.body.message, 'You cannot delete your own account.');
});

test('delete non-last admin succeeds', async () => {
	const result = await call('DELETE', `/admin/users/${userIds.adminSecondary}`, tokens.adminPrimary);
	assert.equal(result.status, 200);
});

test('last-admin delete is blocked', async (t) => {
	const adminCount = await mongoose.connection.collection('users').countDocuments({ role: 'admin' });

	if (adminCount > 1) {
		t.skip('Skipping strict last-admin assertion because there are additional admin users in this environment.');
		return;
	}

	const result = await call('DELETE', `/admin/users/${userIds.adminPrimary}`, tokens.adminSecondary);
	assert.equal(result.status, 400);
	assert.equal(result.body.message, 'Cannot delete the last admin account.');
});

test.after(async () => {
	try {
		const usersCol = mongoose.connection.collection('users');
		await usersCol.deleteMany({ username: { $regex: `^${prefix}_` } });
	} finally {
		await mongoose.disconnect();
		if (startedServer && serverProcess) {
			serverProcess.kill('SIGTERM');
		}
	}
});
