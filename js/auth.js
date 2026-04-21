/**
 * Rajput App - Authentication & Photo Validation Logic
 * File: js/auth.js
 */

import { signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { auth, provider, db, storage } from "./firebase-config.js";
import { doc, getDoc, setDoc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
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

// 3. प्रोफाइल सेव फंक्शन (No Photo = No Entry Rule)
export const saveProfile = async (profileData, photoFile) => {
    try {
        toggleLoader(true);
        const user = auth.currentUser;
        if (!user) throw new Error("User not authenticated");

        // नियम: फोटो अनिवार्य है
        if (!photoFile) {
            alert("सुरक्षा कारणों से प्रोफाइल फोटो अनिवार्य है।");
            toggleLoader(false);
            return;
        }

        // फोटो अपलोड लॉजिक
        const storageRef = ref(storage, `profile_photos/${user.uid}`);
        const snapshot = await uploadBytes(storageRef, photoFile);
        const photoURL = await getDownloadURL(snapshot.ref);

        // डेटाबेस में प्रोफाइल सुरक्षित करना
        const userData = {
            ...profileData,
            uid: user.uid,
            email: user.email,
            photoURL: photoURL,
            isApproved: false, // एडमिन अप्रूवल के लिए वेटलिस्ट में रहेगा
            createdAt: new Date().toISOString(),
            referralCount: 0
        };

        await setDoc(doc(db, "users", user.uid), userData);
        
        alert("प्रोफाइल सफलतापूर्वक भेजी गई! एडमिन के अप्रूवल के बाद आप सदस्य सूची में दिखेंगे।");
        showPage('page-dashboard');

    } catch (error) {
        console.error("Profile Save Error:", error);
        alert("प्रोफाइल सेव करने में समस्या आई।");
    } finally {
        toggleLoader(false);
    }
};

// 4. यूजर की स्थिति चेक करना
export const checkAuthState = () => {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            const userRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userRef);

            // एडमिन चेक
            const isAdmin = user.email === MASTER_ADMIN;
            if (isAdmin) {
                const adminBtn = document.getElementById('btn-admin-panel');
                if (adminBtn) adminBtn.style.display = 'block';
            }

            if (!userSnap.exists()) {
                // नया यूजर है, उसे प्रोफाइल सेटअप पर भेजें
                showPage('page-profile-setup');
            } else {
                // पुराना यूजर है, डैशबोर्ड पर भेजें
                showPage('page-dashboard');
                const userData = userSnap.data();
                document.getElementById('welcome-name').innerText = `जय श्री राम, ${userData.name || 'क्षत्रिय'}`;
                
                updateReferralUI(userData.referralCount || 0, isAdmin);
            }
        } else {
            showPage('page-login');
        }
        toggleLoader(false);
    });
};

function updateReferralUI(count, isAdmin) {
    const refText = document.getElementById('ref-power-text');
    const shareBtn = document.getElementById('btn-share-ref');
    
    if (refText) {
        if (isAdmin) {
            refText.innerText = "Unlimited (Admin)";
        } else {
            refText.innerText = `${count}/11`;
            if (count >= 11 && shareBtn) shareBtn.style.display = 'none';
        }
    }
}
