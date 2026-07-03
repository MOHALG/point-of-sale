const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');

async function runMigration() {
  await mongoose.connect(process.env.MONGO_URI);

  const users = mongoose.connection.collection('users');

  // 1) Backfill missing role to keep old users compatible with role checks.
  const roleResult = await users.updateMany(
    { $or: [{ role: { $exists: false } }, { role: null }] },
    { $set: { role: 'cashier' } }
  );

  // 2) If legacy field "pos" exists, copy it into "assignedPos".
  const copyLegacyPosResult = await users.updateMany(
    {
      assignedPos: { $exists: false },
      pos: { $exists: true, $ne: null },
    },
    [{ $set: { assignedPos: '$pos' } }]
  );

  // 3) Ensure assignedPos exists for all users.
  const assignedPosResult = await users.updateMany(
    { assignedPos: { $exists: false } },
    { $set: { assignedPos: null } }
  );

  console.log('Migration complete');
  console.log(`role updated: ${roleResult.modifiedCount}`);
  console.log(`assignedPos copied from legacy pos: ${copyLegacyPosResult.modifiedCount}`);
  console.log(`assignedPos initialized to null: ${assignedPosResult.modifiedCount}`);

  await mongoose.disconnect();
}

runMigration().catch(async (err) => {
  console.error('Migration failed:', err.message);
  await mongoose.disconnect();
  process.exit(1);
});
