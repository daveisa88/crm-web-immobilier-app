import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

export const firebaseConfig = {
    apiKey: "AIzaSyDmWrlAVFs6XI2bFJuaD-TIq3RA8LOuakM",
    authDomain: "immopilot-7d349.firebaseapp.com",
    projectId: "immopilot-7d349",
    storageBucket: "immopilot-7d349.firebasestorage.app",  // ✅ Correction ici
    messagingSenderId: "646454775585",
    appId: "1:646454775585:web:94b1189e8e6524b1f67860",
    measurementId: "G-VZHVTR1PP5"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
