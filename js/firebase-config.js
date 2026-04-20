import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 1. आपकी फायरबेस कॉन्फ़िग
export const firebaseConfig = {
    apiKey: "AIzaSyC0eEvmS3TYtFDfTjSI5mL9cfUmO3gt23I",
    authDomain: "kshatriya-parichay.firebaseapp.com",
    projectId: "kshatriya-parichay",
    storageBucket: "kshatriya-parichay.firebasestorage.app",
    messagingSenderId: "952092943473",
    appId: "1:952092943473:web:38d14a98f28df05922a7d0"
};

// 2. फायरबेस को चालू करें
const app = initializeApp(firebaseConfig);

// 3. यहाँ से हम ज़रूरी टूल्स को एक्सपोर्ट कर रहे हैं ताकि दूसरी फाइलें इस्तेमाल कर सकें
export const auth = getAuth(app);
export const db = getFirestore(app);
export const provider = new GoogleAuthProvider();
