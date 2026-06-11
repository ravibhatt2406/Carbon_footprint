const admin = require('firebase-admin');
const dotenv = require('dotenv');

dotenv.config();

let db = null;
let auth = null;
let useSimulation = true;

const serviceAccountVar = process.env.FIREBASE_SERVICE_ACCOUNT;
const projectIdVar = process.env.FIREBASE_PROJECT_ID;

if (serviceAccountVar || projectIdVar) {
  try {
    if (serviceAccountVar) {
      let serviceAccount;
      try {
        serviceAccount = JSON.parse(serviceAccountVar);
      } catch (e) {
        // If it's a file path
        serviceAccount = require(serviceAccountVar);
      }
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    } else {
      admin.initializeApp({
        projectId: projectIdVar
      });
    }
    
    db = admin.firestore();
    auth = admin.auth();
    useSimulation = false;
    console.log('Firebase Admin initialized successfully in real production mode.');
  } catch (error) {
    console.warn('Failed to initialize Firebase Admin, falling back to Simulation Mode:', error.message);
  }
} else {
  console.log('No Firebase environment variables found. EcoLens AI is running in SIMULATION MODE.');
}

module.exports = {
  admin,
  db,
  auth,
  useSimulation
};
