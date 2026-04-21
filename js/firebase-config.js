/**
 * Rajput App - Firebase Configuration
 * File: js/firebase-config.js
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

// 1. Firebase Configuration
// नोट: आपकी API Key और Project ID यहाँ सुरक्षित रूप से कॉन्फ़िगर हैं।
const firebaseConfig = {
    apiKey: "AIzaSyC0eEvmS3TYtFDfTjSI5mL9cfUmO3gt23I",
    authDomain: "kshatriya-parichay.firebaseapp.com",
    projectId: "kshatriya-parichay",
    storageBucket: "kshatriya-parichay.firebasestorage.app",
    messagingSenderId: "952092943473",
    appId: "1:952092943473:web:38d14a98f28df05922a7d0"
};

// 2. Initialize Firebase
const app = initializeApp(firebaseConfig);

// 3. Export instances for use in other files (Modular Approach)
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app); // फोटो अपलोड के लिए ज़रूरी
export const provider = new GoogleAuthProvider();

// Google Auth Settings (Optional: Forcing account selection)
provider.setCustomParameters({ prompt: 'select_account' });
