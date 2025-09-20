import { MongoClient, Db } from 'mongodb';
import { attachDatabasePool } from '@vercel/functions';

// MongoDB connection configuration with fallbacks
const getConnectionString = () => {
  // Try environment variable first
  if (process.env.MONGODB_URI) {
    return process.env.MONGODB_URI;
  }
  
  // Try the provided connection string
  const providedUri = 'mongodb+srv://gonana:_)(*!%40%23%24%25%5EJo2030%25%26%24%5E@churchflow.mnlhhpg.mongodb.net/ecwa-settings?retryWrites=true&w=majority&appName=Churchflow';
  
  // Fallback to local MongoDB for development
  const fallbackUri = 'mongodb://localhost:27017/ecwa-settings';
  
  // In production, use the provided URI
  if (process.env.NODE_ENV === 'production') {
    return providedUri;
  }
  
  // In development, try local MongoDB first
  return fallbackUri;
};

const uri = getConnectionString();
const options = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

// Global variable to store the client in development
declare global {
  var _mongoClient: MongoClient | undefined;
}

const globalWithMongo = global as typeof globalThis & {
  _mongoClient: MongoClient | undefined;
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  // In development, use a global variable to preserve the client across hot reloads
  if (!globalWithMongo._mongoClient) {
    globalWithMongo._mongoClient = new MongoClient(uri, options);
  }
  client = globalWithMongo._mongoClient;
  clientPromise = Promise.resolve(client);
} else {
  // In production, create a new client and attach to Vercel's pool manager
  client = new MongoClient(uri, options);
  attachDatabasePool(client);
  clientPromise = client.connect();
}

export async function getDatabase(): Promise<Db> {
  try {
    const client = await clientPromise;
    return client.db('ecwa-settings');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    throw new Error('Database connection failed');
  }
}

export async function getUsersCollection() {
  const db = await getDatabase();
  return db.collection('users');
}

export async function getOrganizationsCollection() {
  const db = await getDatabase();
  return db.collection('organizations');
}

export async function getAgenciesCollection() {
  const db = await getDatabase();
  return db.collection('agencies');
}

export async function getStaffCollection() {
  const db = await getDatabase();
  return db.collection('staff');
}

export async function getLeadersCollection() {
  const db = await getDatabase();
  return db.collection('leaders');
}

export async function getLCCollection() {
  const db = await getDatabase();
  return db.collection('lc');
}

export async function getLCCCollection() {
  const db = await getDatabase();
  return db.collection('lcc');
}

export async function getLeaveCollection() {
  const db = await getDatabase();
  return db.collection('leave_requests');
}

export async function getPayrollCollection() {
  const db = await getDatabase();
  return db.collection('payroll');
}

export async function getQueriesCollection() {
  const db = await getDatabase();
  return db.collection('queries');
}

export async function getExpendituresCollection() {
  const db = await getDatabase();
  return db.collection('expenditures');
}

export async function getIncomeCollection() {
  const db = await getDatabase();
  return db.collection('income');
}

export async function getBankCollection() {
  const db = await getDatabase();
  return db.collection('bank_accounts');
}

export async function getExecutivesCollection() {
  const db = await getDatabase();
  return db.collection('executives');
}

// Initialize database with indexes
export async function initializeDatabase() {
  try {
    const db = await getDatabase();
    
    // Create indexes for better performance
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ orgId: 1 });
    await db.collection('users').createIndex({ role: 1 });
    
    await db.collection('organizations').createIndex({ code: 1 }, { unique: true });
    await db.collection('organizations').createIndex({ type: 1 });
    
    await db.collection('agencies').createIndex({ id: 1 }, { unique: true });
    await db.collection('agencies').createIndex({ orgId: 1 });
    
    await db.collection('staff').createIndex({ email: 1 }, { unique: true });
    await db.collection('staff').createIndex({ orgId: 1 });
    
    await db.collection('leaders').createIndex({ email: 1 }, { unique: true });
    await db.collection('leaders').createIndex({ orgId: 1 });
    
    await db.collection('lc').createIndex({ code: 1 }, { unique: true });
    await db.collection('lc').createIndex({ orgId: 1 });
    
    await db.collection('lcc').createIndex({ code: 1 }, { unique: true });
    await db.collection('lcc').createIndex({ orgId: 1 });
    
    console.log('✅ MongoDB database initialized with indexes');
  } catch (error) {
    console.error('❌ Error initializing MongoDB database:', error);
    throw error;
  }
}

export { clientPromise };
