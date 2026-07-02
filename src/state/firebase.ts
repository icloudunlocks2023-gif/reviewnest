import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBeqy1yzd6q8ChCJDiKibsOtMzEvQrnH28",
  authDomain: "icloudie.firebaseapp.com",
  projectId: "icloudie",
  storageBucket: "icloudie.firebasestorage.app",
  messagingSenderId: "318062672242",
  appId: "1:318062672242:web:288f0645f9d58ec06bc5eb"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with custom database ID
export const db = getFirestore(app, "ai-studio-reviewhubpro-1cfacda6-e071-4144-a481-b3bd724048a8");
