import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCZ2atknT3IcplZdNoLKoX2wykITOPWjY0",
  authDomain: "teste-82008.firebaseapp.com",
  projectId: "teste-82008",
  storageBucket: "teste-82008.firebasestorage.app",
  messagingSenderId: "1046408203585",
  appId: "1:1046408203585:web:de09110eb0b2ecd57425c0",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
