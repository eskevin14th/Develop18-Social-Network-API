const { MongoClient } = require('mongodb');
const uri = 'mongodb://localhost/socialnetDB';
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// Define the user schema
const userSchema = {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['username', 'email'],
      properties: {
        username: {
          bsonType: 'string',
          description: 'must be a string and is required'
        },
        email: {
          bsonType: 'string',
          description: 'must be a string and is required'
        },
        thoughts: {
          bsonType: 'array',
          items: {
            bsonType: 'objectId',
            ref: 'Thought'
          },
          description: 'must be an array of ObjectIds referencing the Thought collection'
        },
        friends: {
          bsonType: 'array',
          items: {
            bsonType: 'objectId',
            ref: 'User'
          },
          description: 'must be an array of ObjectIds referencing the User collection'
        }
      }
    }
  }
};

async function test() {
  try {
    // Connect to the database
    await client.connect();
    console.log('Connected to MongoDB');

    // Create the user collection
    const userCollection = client.db().collection('User');
    await userCollection.createIndex({ username: 1 }, { unique: true });
    await userCollection.createIndex({ email: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } });

    // Create a new user
    const user = {
      username: 'food',
      email: 'food@example.com',
      thoughts: [],
      friends: []
    };

    // Insert the user into the collection
    const result = await userCollection.insertOne(user);

    // Find the user in the collection
    const foundUser = await userCollection.findOne({ username: 'food' });

    // Log the user to the console
    console.log('Found a user:', foundUser);

    // Disconnect from the database
    await client.close();
    console.log('Disconnected from MongoDB');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

// Call the test function
test();
