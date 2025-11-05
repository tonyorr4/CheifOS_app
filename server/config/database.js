/**
 * Database Configuration - Firebase Firestore
 * Initializes Firebase Admin SDK and Firestore client
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
let db = null;
let isInitialized = false;

function initializeFirebase() {
  // Check if Firebase credentials are provided
  if (!process.env.FIREBASE_PROJECT_ID) {
    console.log('⚠️  Firebase not configured - FIREBASE_PROJECT_ID missing');
    console.log('   Database operations will fail until credentials are added to .env');
    return null;
  }

  try {
    // Initialize Firebase Admin with credentials from environment variables
    const serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL
    };

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID
    });

    db = admin.firestore();
    isInitialized = true;

    console.log('✅ Firebase Firestore initialized successfully');
    console.log(`   Project: ${process.env.FIREBASE_PROJECT_ID}`);

    return db;
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error.message);
    console.error('   Check your Firebase credentials in .env file');
    return null;
  }
}

// Initialize on module load
db = initializeFirebase();

/**
 * Get Firestore database instance
 */
function getDb() {
  if (!db) {
    console.warn('⚠️  Database not initialized. Check Firebase credentials.');
  }
  return db;
}

/**
 * Test database connection
 */
async function testConnection() {
  if (!db) {
    console.log('❌ Cannot test connection - database not initialized');
    return false;
  }

  try {
    // Try to read from a test collection
    const testRef = db.collection('_test');
    await testRef.doc('connection_test').set({
      timestamp: new Date(),
      status: 'connected'
    });

    const doc = await testRef.doc('connection_test').get();

    if (doc.exists) {
      console.log('✅ Database connection test successful');
      // Clean up test document
      await testRef.doc('connection_test').delete();
      return true;
    }

    return false;
  } catch (error) {
    console.error('❌ Database connection test failed:', error.message);
    return false;
  }
}

/**
 * Collections
 */
const COLLECTIONS = {
  MESSAGES: 'messages',
  KNOWLEDGE_BASE: 'knowledge_base',
  RESPONSE_PATTERNS: 'response_patterns'
};

module.exports = {
  getDb,
  testConnection,
  isInitialized,
  COLLECTIONS
};
