import { signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { auth, provider } from "./firebase-config.js"; // सीधा कॉन्फ़िग से आ रहा है
import { showPage, toggleLoader } from "./ui.js";

// लॉगिन फंक्शन
export const login = async () => {
    try {
        await signInWithPopup(auth, provider);
        // लॉगिन सफल होने पर डैशबोर्ड दिखाएं
        showPage('page-dashboard');
    } catch (error) {
        console.error("लॉगिन त्रुटि:", error);
        alert("लॉगिन विफल रहा। कृपया इंटरनेट चेक करें।");
        toggleLoader(false);
    }
};

// लॉगआउट फंक्शन
export const logout = async () => {
    try {
        await signOut(auth);
        showPage('page-login');
    } catch (error) {
        console.error("लॉगआउट त्रुटि:", error);
    }
};

// यूज़र की स्थिति पर नज़र रखना
export const checkAuthState = () => {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            console.log("स्वागत है:", user.displayName);
            showPage('page-dashboard');
        } else {
            showPage('page-login');
        }
        // चेक पूरा होने पर लोडर हटा दें
        toggleLoader(false);
    });
};
