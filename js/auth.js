import { signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { auth, provider, db } from "./firebase-config.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { showPage, toggleLoader } from "./ui.js";

const MASTER_ADMIN = "kshatriyaparichayak@gmail.com";

// लॉगिन फंक्शन
export const login = async () => {
    try {
        toggleLoader(true);
        await signInWithPopup(auth, provider);
    } catch (error) {
        console.error("Login Error:", error);
        alert("लॉगिन विफल रहा। कृपया पुनः प्रयास करें।");
        toggleLoader(false);
    }
};

// लॉगआउट फंक्शन
export const logout = async () => {
    try {
        await signOut(auth);
        showPage('page-login');
    } catch (error) {
        console.error("Logout Error:", error);
    }
};

// यूजर की स्थिति और सिक्योरिटी चेक
export const checkAuthState = () => {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            const userRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userRef);

            // 1. एडमिन चेक
            const isAdmin = user.email === MASTER_ADMIN;
            if (isAdmin) {
                const adminBtn = document.getElementById('btn-admin-panel');
                if(adminBtn) adminBtn.style.display = 'block';
            }

            // 2. नए यूजर के लिए नियम (प्रोफाइल और रेफरल)
            if (!userSnap.exists()) {
                const urlParams = new URLSearchParams(window.location.search);
                const refCode = urlParams.get('ref');

                // अगर न एडमिन है और न ही रेफरल लिंक है
                if (!refCode && !isAdmin) {
                    alert("क्षमा करें! प्रवेश के लिए रेफरल लिंक अनिवार्य है।");
                    await signOut(auth);
                    toggleLoader(false);
                    return;
                }
                
                // नया यूजर है, प्रोफाइल सेटअप पर भेजें
                showPage('page-profile-setup');
            } else {
                // 3. पुराना यूजर है, डैशबोर्ड पर भेजें
                showPage('page-dashboard');
                document.getElementById('welcome-name').innerText = `जय श्री राम, ${userSnap.data().name || 'क्षत्रिय'}`;
                
                // रेफरल शक्ति अपडेट करें
                updateReferralUI(userSnap.data().referralCount || 0, isAdmin);
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
            // अगर 11 पूरे हो गए तो शेयर बटन गायब
            if (count >= 11 && shareBtn) {
                shareBtn.style.display = 'none';
            }
        }
    }
}
