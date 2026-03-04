import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration - from Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyB-RsH8ZtmTSgX5JbSyXrVdrYZ-I2_Cb4o",
  authDomain: "livemusictracker-6eeaf.firebaseapp.com",
  projectId: "livemusictracker-6eeaf",
  storageBucket: "livemusictracker-6eeaf.firebasestorage.app",
  messagingSenderId: "1077269817537",
  appId: "1:1077269817537:web:e09774dda09e5e4a85cc40"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;

