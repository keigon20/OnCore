import { initializeApp, getApps, getApp } from 'firebase/app';
// @ts-ignore - getReactNativePersistence is not in types but available at runtime
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

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

// Initialize Firebase services with AsyncStorage persistence for React Native
// Using ts-ignore because the RN-specific types are not exported in the main firebase package
// @ts-ignore
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

export { auth };
// useFetchStreams isn't in the public FirestoreSettings type for this SDK version,
// but RN's fetch lacks streaming support so it must be disabled for long-polling to work.
export const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true,
  useFetchStreams: false,
  ignoreUndefinedProperties: true,
} as any);

export const storage = getStorage(app);

export default app;

