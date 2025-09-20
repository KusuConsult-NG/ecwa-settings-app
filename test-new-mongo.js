// Test MongoDB connection with new password
const { MongoClient } = require('mongodb');

async function testNewMongoConnection() {
  console.log('🔧 TESTING MONGODB WITH NEW PASSWORD\n');

  const uri = 'mongodb+srv://gonana:YRJXv3mTD2Xtt854@churchflow.mnlhhpg.mongodb.net/ecwa-settings?retryWrites=true&w=majority&appName=Churchflow';
  
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
    await testCollection.insertOne({ 
      test: 'connection', 
      timestamp: new Date(),
      message: 'MongoDB connection working with new password'
    });
    console.log('✅ Write test successful');
    
    // Test reading data
    const result = await testCollection.findOne({ test: 'connection' });
    console.log('✅ Read test successful:', result);
    
    await client.close();
    console.log('✅ Connection closed successfully');
    
    console.log('\n🎉 MONGODB CONNECTION IS WORKING!');
    console.log('✅ New password is correct');
    console.log('✅ Database is accessible');
    console.log('✅ Ready for production use');
    
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

testNewMongoConnection();
