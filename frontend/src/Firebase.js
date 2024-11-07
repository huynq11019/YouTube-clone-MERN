import { initializeApp } from "firebase/app";
import { getStorage} from 'firebase/storage';
import {getFirestore} from "firebase/firestore"

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBbGNe_sYx8N09SWbcOfCmLNVfkWvQ4Jbg",
  authDomain: "me-chat-a2693.firebaseapp.com",
  databaseURL: "https://me-chat-a2693-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "me-chat-a2693",
  storageBucket: "me-chat-a2693.appspot.com",
  messagingSenderId: "352618140115",
  appId: "1:352618140115:web:5d18e81fd6aae0402d1f26",
  measurementId: "G-4QT1PTL3L6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const storage = getStorage(app)
export const db = getFirestore(app)


