// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  "projectId": "studio-6000332721-2a049",
  "appId": "1:1004422612097:web:004e9827ffd2955a043980",
  "apiKey": "AIzaSyCLvcNNiui9oyc9z9VUWJfOMPHZHgShvQ4",
  "authDomain": "studio-6000332721-2a049.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "1004422612097"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
