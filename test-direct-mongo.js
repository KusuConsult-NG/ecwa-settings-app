// Test MongoDB connection directly
const { MongoClient } = require('mongodb');

async function testDirectMongo() {
  console.log('🔧 TESTING DIRECT MONGODB CONNECTION\n');

  // Test with encoded password
  const uri = 'mongodb+srv://gonana:_)(*!%40%23%24%25%5EJo2030%25%26%24%5E@churchflow.mnlhhpg.mongodb.net/ecwa-settings?retryWrites=true&w=majority&appName=Churchflow';
  
  console.log('Testing connection...');
  console.log('URI:', uri);

  try {
    const client = new MongoClient(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    console.log('Attempting to connect...');
    await client.connect();
    console.log('✅ MongoDB connection successful!');
    
    const db = client.db('ecwa-settings');
    console.log('✅ Database accessible');
    
    // Test creating a collection
    const testCollection = db.collection('test');
    await testCollection.insertOne({ test: 'connection', timestamp: new Date() });
    console.log('✅ Write test successful');
    
    await client.close();
    console.log('✅ Connection closed successfully');
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.log('\n🔧 TROUBLESHOOTING:');
    console.log('1. Check if MongoDB Atlas cluster is running');
    console.log('2. Verify IP whitelist in MongoDB Atlas');
    console.log('3. Check if user "gonana" has proper permissions');
    console.log('4. Verify the cluster name "churchflow" is correct');
    console.log('5. Check if the database "ecwa-settings" exists');
  }
}

testDirectMongo();
