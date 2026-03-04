// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB-RsH8ZtmTSgX5JbSyXrVdrYZ-I2_Cb4o",
  authDomain: "livemusictracker-6eeaf.firebaseapp.com",
  projectId: "livemusictracker-6eeaf",
  storageBucket: "livemusictracker-6eeaf.firebasestorage.app",
  messagingSenderId: "1077269817537",
  appId: "1:1077269817537:web:e09774dda09e5e4a85cc40",
  measurementId: "G-8PQ3J5X3HW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);