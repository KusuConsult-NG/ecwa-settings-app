// Debug MongoDB connection issues
const { MongoClient } = require('mongodb');

async function debugMongoConnection() {
  console.log('🔧 DEBUGGING MONGODB CONNECTION\n');

  // Test different connection approaches
  const connectionStrings = [
    // Original with special characters
    'mongodb+srv://gonana:_)(*!@#$%^Jo2030%&$^@churchflow.mnlhhpg.mongodb.net/ecwa-settings?retryWrites=true&w=majority&appName=Churchflow',
    
    // URL encoded password
    'mongodb+srv://gonana:_)(*!%40%23%24%25%5EJo2030%25%26%24%5E@churchflow.mnlhhpg.mongodb.net/ecwa-settings?retryWrites=true&w=majority&appName=Churchflow',
    
    // Without database name
    'mongodb+srv://gonana:_)(*!%40%23%24%25%5EJo2030%25%26%24%5E@churchflow.mnlhhpg.mongodb.net/?retryWrites=true&w=majority&appName=Churchflow',
    
    // With different options
    'mongodb+srv://gonana:_)(*!%40%23%24%25%5EJo2030%25%26%24%5E@churchflow.mnlhhpg.mongodb.net/ecwa-settings?retryWrites=true&w=majority'
  ];

  for (let i = 0; i < connectionStrings.length; i++) {
    const uri = connectionStrings[i];
    console.log(`\n--- Testing Connection ${i + 1} ---`);
    console.log('URI:', uri);
    
    try {
      const client = new MongoClient(uri, {
        maxPoolSize: 1,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 10000,
      });

      console.log('Attempting to connect...');
      await client.connect();
      console.log('✅ Connection successful!');
      
      const db = client.db('ecwa-settings');
      console.log('✅ Database accessible');
      
      await client.close();
      console.log('✅ Connection closed');
      
      // If we get here, this connection works
      console.log('\n🎉 WORKING CONNECTION FOUND!');
      console.log('Use this URI:', uri);
      return;
      
    } catch (error) {
      console.log('❌ Connection failed:', error.message);
    }
  }
  
  console.log('\n🔧 ALL CONNECTIONS FAILED - POSSIBLE ISSUES:');
  console.log('1. MongoDB Atlas cluster is not running');
  console.log('2. IP address not whitelisted in MongoDB Atlas');
  console.log('3. User "gonana" does not exist or has no permissions');
  console.log('4. Cluster name "churchflow" is incorrect');
  console.log('5. Network connectivity issues');
  console.log('\n📋 TO FIX:');
  console.log('1. Go to https://cloud.mongodb.com/');
  console.log('2. Check if cluster "churchflow" is running');
  console.log('3. Go to Network Access and add 0.0.0.0/0 (or your IP)');
  console.log('4. Go to Database Access and verify user "gonana" exists');
  console.log('5. Make sure user has "readWrite" permissions');
}

debugMongoConnection();
