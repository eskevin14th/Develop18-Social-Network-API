const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const uri = 'mongodb://localhost/socialnetDB';
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const router = express.Router();

async function withDB(callback) {
  try {
    await client.connect();
    const db = client.db();
    await callback(db);
  } catch (err) {
    console.error(err);
    throw err;
  } finally {
    await client.close();
  }
}

// Get all users
router.get('/', async (req, res) => {
  await withDB(async (db) => {
    const users = await db.collection('User').find().toArray();
    res.json(users);
  });
});

// Get a user by ID
router.get('/:userId', async (req, res) => {
  await withDB(async (db) => {
    const user = await db.collection('User').findOne({ _id: new ObjectId(req.params.userId) });
    res.json(user);
  });
});

// Create a new user
router.post('/', async (req, res) => {
  await withDB(async (db) => {
    const result = await db.collection('User').insertOne(req.body);
    res.json(result.ops[0]);
  });
});

// Update a user by ID
router.put('/:userId', async (req, res) => {
  await withDB(async (db) => {
    const result = await db.collection('User').updateOne(
      { _id: new ObjectId(req.params.userId) },
      { $set: req.body }
    );
    res.json(result);
  });
});

// Delete a user by ID
router.delete('/:userId', async (req, res) => {
  await withDB(async (db) => {
    const result = await db.collection('User').deleteOne({ _id: new ObjectId(req.params.userId) });
    res.json(result);
  });
});

// Add a friend for a user by ID
router.post('/:userId/friends/:friendId', async (req, res) => {
  await withDB(async (db) => {
    const result = await db.collection('User').updateOne(
      { _id: new ObjectId(req.params.userId) },
      { $push: { friends: new ObjectId(req.params.friendId) } }
    );
    res.json(result);
  });
});

// Remove a friend for a user by ID
router.delete('/:userId/friends/:friendId', async (req, res) => {
  await withDB(async (db) => {
    const result = await db.collection('User').updateOne(
      { _id: new ObjectId(req.params.userId) },
      { $pull: { friends: new ObjectId(req.params.friendId) } }
    );
    res.json(result);
  });
});

module.exports = router;
