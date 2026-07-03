require('dotenv').config();
const mongoose = require('mongoose');

const API = process.env.API_BASE_URL || 'http://localhost:3000';
const PASSWORD = process.env.SMOKE_PASSWORD || 'Smoke12345';
const ts = Date.now();
const prefix = `smoke_pos203_${ts}`;

const users = {
  admin: `${prefix}_admin`,
  manager: `${prefix}_manager`,
  cashier: `${prefix}_cashier`,
};

async function call(method, path, token, body) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.authorization = `Bearer ${token}`;

  const response = await fetch(`${API}${path}`, {
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

function assertResult(name, result, expectedStatus, expectedMessage) {
  const message = result && result.body ? result.body.message : '';
  const statusOk = result.status === expectedStatus;
  const messageOk = expectedMessage ? message === expectedMessage : true;
  const ok = statusOk && messageOk;

  const details = [
    `${ok ? 'PASS' : 'FAIL'} | ${name}`,
    `status=${result.status}`,
    `message=${message || '-'}`,
  ];

  if (expectedMessage) {
    details.push(`expectedMessage=${expectedMessage}`);
  }

  console.log(details.join(' | '));
  return ok;
}

async function ensureServerIsReachable() {
  try {
    await fetch(`${API}/auth/sign-in`, { method: 'OPTIONS' });
  } catch (error) {
    throw new Error(
      `Cannot reach API at ${API}. Start backend first with \"npm run dev\" and retry.`
    );
  }
}

async function run() {
  await ensureServerIsReachable();
  await mongoose.connect(process.env.MONGO_URI);

  const db = mongoose.connection.collection.bind(mongoose.connection);
  const usersCol = db('users');

  const posDocs = await db('pos').find({}).limit(2).toArray();
  if (posDocs.length < 2) {
    throw new Error('Need at least 2 POS records in MongoDB to run cross-POS checks.');
  }

  const assignedPos = String(posDocs[0]._id);
  const crossPos = String(posDocs[1]._id);

  for (const userType of Object.keys(users)) {
    const signup = await call('POST', '/auth/sign-up', null, {
      username: users[userType],
      password: PASSWORD,
    });

    if (![201, 409].includes(signup.status)) {
      throw new Error(`Sign-up failed for ${users[userType]}: ${signup.status}`);
    }
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

  const tokens = {};
  for (const userType of Object.keys(users)) {
    const signin = await call('POST', '/auth/sign-in', null, {
      username: users[userType],
      password: PASSWORD,
    });

    if (signin.status !== 200 || !signin.body || !signin.body.token) {
      throw new Error(`Sign-in failed for ${users[userType]}: ${signin.status}`);
    }

    tokens[userType] = signin.body.token;
  }

  const catA = await call('POST', '/categories/create', tokens.admin, {
    name: `${prefix}_cat_a`,
    pos: assignedPos,
  });
  const catB = await call('POST', '/categories/create', tokens.admin, {
    name: `${prefix}_cat_b`,
    pos: crossPos,
  });

  if (catA.status !== 201 || catB.status !== 201) {
    throw new Error('Failed to create setup categories.');
  }

  const itemA = await call('POST', '/items/create', tokens.admin, {
    name: `${prefix}_item_a`,
    price: 1,
    pos: assignedPos,
  });
  const itemB = await call('POST', '/items/create', tokens.admin, {
    name: `${prefix}_item_b`,
    price: 2,
    pos: crossPos,
  });

  if (itemA.status !== 201 || itemB.status !== 201) {
    throw new Error('Failed to create setup items.');
  }

  const catBId = String(catB.body._id);
  const itemAId = String(itemA.body._id);
  const itemBId = String(itemB.body._id);

  let failures = 0;

  failures += assertResult(
    'manager assigned POS /pos/:id',
    await call('GET', `/pos/${assignedPos}`, tokens.manager),
    200
  )
    ? 0
    : 1;

  failures += assertResult(
    'manager assigned POS /items/:id',
    await call('GET', `/items/${itemAId}`, tokens.manager),
    200
  )
    ? 0
    : 1;

  failures += assertResult(
    'manager cross-POS /items/:id',
    await call('GET', `/items/${itemBId}`, tokens.manager),
    403,
    'Forbidden: cross-POS access denied.'
  )
    ? 0
    : 1;

  failures += assertResult(
    'manager cross-POS /categories/:id',
    await call('GET', `/categories/${catBId}`, tokens.manager),
    403,
    'Forbidden: cross-POS access denied.'
  )
    ? 0
    : 1;

  failures += assertResult(
    'cashier assigned POS /pos/:id',
    await call('GET', `/pos/${assignedPos}`, tokens.cashier),
    200
  )
    ? 0
    : 1;

  failures += assertResult(
    'cashier assigned POS /items/:id',
    await call('GET', `/items/${itemAId}`, tokens.cashier),
    200
  )
    ? 0
    : 1;

  failures += assertResult(
    'cashier cross-POS /items/:id',
    await call('GET', `/items/${itemBId}`, tokens.cashier),
    403,
    'Forbidden: cross-POS access denied.'
  )
    ? 0
    : 1;

  failures += assertResult(
    'cashier role gate /categories/all',
    await call('GET', '/categories/all', tokens.cashier),
    403,
    'Forbidden: insufficient role.'
  )
    ? 0
    : 1;

  failures += assertResult(
    'admin cross-POS allowed /items/:id',
    await call('GET', `/items/${itemBId}`, tokens.admin),
    200
  )
    ? 0
    : 1;

  console.log('\nUsers:');
  console.log(JSON.stringify(users, null, 2));
  console.log(`assignedPos=${assignedPos}`);
  console.log(`crossPos=${crossPos}`);
  console.log(`TOTAL FAILURES=${failures}`);

  await mongoose.disconnect();
  process.exit(failures === 0 ? 0 : 1);
}

run().catch(async (error) => {
  console.error(`SMOKE ERROR: ${error.message}`);
  try {
    await mongoose.disconnect();
  } catch {
    // no-op
  }
  process.exit(1);
});
