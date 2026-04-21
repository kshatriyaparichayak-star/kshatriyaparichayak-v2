/**
 * Rajput App - Authentication & Invisible Admin Logic
 * File: js/auth.js
 */

import { signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { auth, provider, db, storage } from "./firebase-config.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";
import { showPage, toggleLoader } from "./ui.js";

const MASTER_ADMIN = "kshatriyaparichayak@gmail.com";

// 1. लॉगिन फंक्शन
export const login = async () => {
    try {
        toggleLoader(true);
        await signInWithPopup(auth, provider);
    } catch (error) {
        console.error("Login Error:", error);
        alert("लॉगिन विफल रहा।");
        toggleLoader(false);
    }
};

// 2. लॉगआउट फंक्शन
export const logout = async () => {
    try {
        await signOut(auth);
        showPage('page-login');
    } catch (error) {
        console.error("Logout Error:", error);
    }
};

// 3. प्रोफाइल सेव फंक्शन (Invisible Admin Protection)
export const saveProfile = async (profileData, photoFile) => {
    try {
        const user = auth.currentUser;
        if (!user) return;

        // नियम: एडमिन को प्रोफाइल सेव करने की जरूरत नहीं (वह पब्लिक नहीं होगा)
        if (user.email === MASTER_ADMIN) {
            alert("एडमिन को प्रोफाइल बनाने की आवश्यकता नहीं है।");
            showPage('page-dashboard');
            return;
        }

        if (!photoFile) {
            alert("सुरक्षा के लिए प्रोफाइल फोटो अनिवार्य है।");
            return;
        }

        toggleLoader(true);
        const storageRef = ref(storage, `profile_photos/${user.uid}`);
        const snapshot = await uploadBytes(storageRef, photoFile);
        const photoURL = await getDownloadURL(snapshot.ref);

        const userData = {
            ...profileData,
            uid: user.uid,
            email: user.email,
            photoURL: photoURL,
            isApproved: false, // वेटलिस्ट मोड
            role: "member",
            createdAt: new Date().toISOString()
        };

        await setDoc(doc(db, "users", user.uid), userData);
        alert("प्रोफाइल सुरक्षित! एडमिन अप्रूवल के बाद आप सूची में दिखेंगे।");
        showPage('page-dashboard');

    } catch (error) {
        console.error("Profile Save Error:", error);
        alert("सेव करने में त्रुटि आई।");
    } finally {
        toggleLoader(false);
    }
};

// 4. यूजर की स्थिति चेक करना (Invisible Admin Logic)
export const checkAuthState = () => {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            const isAdmin = user.email === MASTER_ADMIN;
            const userRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userRef);

            // UI Elements को कंट्रोल करना
            const memberContent = document.getElementById('member-only-content');
            const adminBtn = document.getElementById('btn-admin-panel');
            const welcomeText = document.getElementById('welcome-msg');

            if (isAdmin) {
                // एडमिन के लिए विशेष व्यवहार: न प्रोफाइल बनेगी, न लिस्ट में दिखेगा
                if (adminBtn) adminBtn.style.display = 'block';
                if (memberContent) memberContent.style.display = 'none'; // No Alert/Sahyog for Admin
                if (welcomeText) welcomeText.innerText = "प्रणाम, मुख्य एडमिन साहब";
                showPage('page-dashboard');
            } else {
                // मेंबर्स के लिए
                if (adminBtn) adminBtn.style.display = 'none';
                if (memberContent) memberContent.style.display = 'block';

                if (!userSnap.exists()) {
                    showPage('page-profile-setup');
                } else {
                    const data = userSnap.data();
                    if (welcomeText) welcomeText.innerText = `जय श्री राम, ${data.name}`;
                    showPage('page-dashboard');
                }
            }
        } else {
            showPage('page-login');
        }
        toggleLoader(false);
    });
};
