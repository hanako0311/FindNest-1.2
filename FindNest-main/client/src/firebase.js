// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "findnest-capstone.firebaseapp.com",
  projectId: "findnest-capstone",
  storageBucket: "findnest-capstone.appspot.com",
  messagingSenderId: "1041608138144",
  appId: "1:1041608138144:web:7a720c663e1fb797a818c5",
  measurementId: "G-89Z2JWC407",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
