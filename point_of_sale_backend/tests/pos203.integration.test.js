const test = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const path = require('node:path');
const mongoose = require('mongoose');

require('dotenv').config();

const API = process.env.API_BASE_URL || 'http://localhost:3000';
const PASSWORD = process.env.TEST_PASSWORD || 'Smoke12345';
const ts = Date.now();
const prefix = `itest_pos203_${ts}`;

let serverProcess = null;
let startedServer = false;

let assignedPos = null;
let crossPos = null;

const users = {
  admin: `${prefix}_admin`,
  manager: `${prefix}_manager`,
  cashier: `${prefix}_cashier`,
};

const tokens = {
  admin: null,
  manager: null,
  cashier: null,
};

const resourceIds = {
  itemAssigned: null,
  itemCross: null,
  categoryCross: null,
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

async function waitForServer(timeoutMs = 15000) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    if (await isServerUp()) return;
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
  throw new Error('Timed out waiting for backend server to start.');
}

async function ensureServer() {
  if (await isServerUp()) return;

  const serverPath = path.join(process.cwd(), 'server.js');
  serverProcess = spawn('node', [serverPath], {
    cwd: process.cwd(),
    stdio: 'pipe',
    shell: true,
  });

  startedServer = true;
  await waitForServer();
}

test.before(async () => {
  await ensureServer();
  await mongoose.connect(process.env.MONGO_URI);

  const db = mongoose.connection.collection.bind(mongoose.connection);
  const usersCol = db('users');

  const posDocs = await db('pos').find({}).limit(2).toArray();
  assert.ok(posDocs.length >= 2, 'Need at least 2 POS docs for cross-POS integration tests');

  assignedPos = String(posDocs[0]._id);
  crossPos = String(posDocs[1]._id);

  for (const userType of Object.keys(users)) {
    const signup = await call('POST', '/auth/sign-up', null, {
      username: users[userType],
      password: PASSWORD,
    });

    assert.ok([201, 409].includes(signup.status), `Failed sign-up for ${users[userType]}`);
  }

  await usersCol.updateOne(
    { username: users.admin },
    { $set: { role: 'admin', assignedPos: null } }
  );
  await usersCol.updateOne(
    { username: users.manager },
    { $set: { role: 'manager', assignedPos: new mongoose.Types.ObjectId(assignedPos) } }
  );
  await usersCol.updateOne(
    { username: users.cashier },
    { $set: { role: 'cashier', assignedPos: new mongoose.Types.ObjectId(assignedPos) } }
  );

  for (const userType of Object.keys(users)) {
    const signin = await call('POST', '/auth/sign-in', null, {
      username: users[userType],
      password: PASSWORD,
    });

    assert.equal(signin.status, 200, `Sign-in failed for ${users[userType]}`);
    assert.ok(signin.body && signin.body.token, `Missing token for ${users[userType]}`);
    tokens[userType] = signin.body.token;
  }

  const categoryAssigned = await call('POST', '/categories/create', tokens.admin, {
    name: `${prefix}_cat_assigned`,
    pos: assignedPos,
  });

  const categoryCross = await call('POST', '/categories/create', tokens.admin, {
    name: `${prefix}_cat_cross`,
    pos: crossPos,
  });

  assert.equal(categoryAssigned.status, 201, 'Failed to create assigned category');
  assert.equal(categoryCross.status, 201, 'Failed to create cross category');
  resourceIds.categoryCross = String(categoryCross.body._id);

  const itemAssigned = await call('POST', '/items/create', tokens.admin, {
    name: `${prefix}_item_assigned`,
    price: 1,
    pos: assignedPos,
  });

  const itemCross = await call('POST', '/items/create', tokens.admin, {
    name: `${prefix}_item_cross`,
    price: 2,
    pos: crossPos,
  });

  assert.equal(itemAssigned.status, 201, 'Failed to create assigned item');
  assert.equal(itemCross.status, 201, 'Failed to create cross item');
  resourceIds.itemAssigned = String(itemAssigned.body._id);
  resourceIds.itemCross = String(itemCross.body._id);
});

test('manager assigned POS succeeds and cross-POS is blocked', async () => {
  const assignedPosResult = await call('GET', `/pos/${assignedPos}`, tokens.manager);
  assert.equal(assignedPosResult.status, 200);

  const assignedItemResult = await call('GET', `/items/${resourceIds.itemAssigned}`, tokens.manager);
  assert.equal(assignedItemResult.status, 200);

  const crossItemResult = await call('GET', `/items/${resourceIds.itemCross}`, tokens.manager);
  assert.equal(crossItemResult.status, 403);
  assert.equal(crossItemResult.body.message, 'Forbidden: cross-POS access denied.');

  const crossCategoryResult = await call('GET', `/categories/${resourceIds.categoryCross}`, tokens.manager);
  assert.equal(crossCategoryResult.status, 403);
  assert.equal(crossCategoryResult.body.message, 'Forbidden: cross-POS access denied.');
});

test('cashier assigned POS succeeds and cross-POS is blocked', async () => {
  const assignedPosResult = await call('GET', `/pos/${assignedPos}`, tokens.cashier);
  assert.equal(assignedPosResult.status, 200);

  const assignedItemResult = await call('GET', `/items/${resourceIds.itemAssigned}`, tokens.cashier);
  assert.equal(assignedItemResult.status, 200);

  const crossItemResult = await call('GET', `/items/${resourceIds.itemCross}`, tokens.cashier);
  assert.equal(crossItemResult.status, 403);
  assert.equal(crossItemResult.body.message, 'Forbidden: cross-POS access denied.');
});

test('admin can access cross-POS resources', async () => {
  const adminItemResult = await call('GET', `/items/${resourceIds.itemCross}`, tokens.admin);
  assert.equal(adminItemResult.status, 200);

  const adminPosResult = await call('GET', `/pos/${crossPos}`, tokens.admin);
  assert.equal(adminPosResult.status, 200);
});

test.after(async () => {
  try {
    const db = mongoose.connection.collection.bind(mongoose.connection);

    await db('items').deleteMany({ name: { $regex: `^${prefix}_` } });
    await db('itemcategories').deleteMany({ name: { $regex: `^${prefix}_` } });
    await db('users').deleteMany({ username: { $regex: `^${prefix}_` } });
  } finally {
    await mongoose.disconnect();

    if (startedServer && serverProcess) {
      serverProcess.kill('SIGTERM');
    }
  }
});
