import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { firebaseConfig } from "./firebase-config.js";
import { showPage } from "./ui.js";

// Firebase शुरू करें
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// लॉगिन फंक्शन
export const login = async () => {
    try {
        await signInWithPopup(auth, provider);
        // लॉगिन सफल होने पर Dashboard पर ले जाएं
        showPage('page-dashboard');
    } catch (error) {
        console.error("लॉगिन में दिक्कत आई:", error);
        alert("लॉगिन नहीं हो पाया, कृपया दोबारा कोशिश करें।");
    }
};

// लॉगआउट फंक्शन
export const logout = async () => {
    await signOut(auth);
    showPage('page-login');
};

// यह चेक करता रहेगा कि यूज़र लॉगिन है या नहीं
export const checkAuthState = () => {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            console.log("यूज़र लॉगिन है:", user.displayName);
            showPage('page-dashboard');
        } else {
            showPage('page-login');
        }
    });
};
