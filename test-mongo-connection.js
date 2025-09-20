// Test MongoDB connection directly
const { MongoClient } = require('mongodb');

async function testMongoConnection() {
  console.log('🔧 TESTING MONGODB CONNECTION DIRECTLY\n');

  // Your connection string with URL encoded password
  const uri = 'mongodb+srv://gonana:_)(*!%40%23%24%25%5EJo2030%25%26%24%5E@churchflow.mnlhhpg.mongodb.net/ecwa-settings?retryWrites=true&w=majority&appName=Churchflow';
  
  console.log('Connection string:', uri);
  console.log('Testing connection...');

  try {
    const client = new MongoClient(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    await client.connect();
    console.log('✅ MongoDB connection successful!');
    
    const db = client.db('ecwa-settings');
    const collections = await db.listCollections().toArray();
    console.log('✅ Database accessible, collections:', collections.length);
    
    await client.close();
    console.log('✅ Connection closed successfully');
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.log('\n🔧 POSSIBLE SOLUTIONS:');
    console.log('1. Check if the password contains special characters that need encoding');
    console.log('2. Verify the cluster is accessible from your IP');
    console.log('3. Check if the database user has proper permissions');
    console.log('4. Try using a simpler password without special characters');
  }
}

testMongoConnection();
