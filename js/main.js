import { showPage, toggleLoader } from './ui.js';
import { login, checkAuthState } from './auth.js';
import { loadMembers } from './members.js'; // सदस्य लोड करने वाला फंक्शन

document.addEventListener('DOMContentLoaded', () => {
    toggleLoader(true); 
    checkAuthState();   

    // --- लॉगिन बटन ---
    document.getElementById('login-btn')?.addEventListener('click', () => {
        toggleLoader(true);
        login();
    });

    // --- सदस्य सूची बटन ---
    document.getElementById('btn-goto-members')?.addEventListener('click', () => {
        showPage('page-members'); // पेज बदलें
        loadMembers();            // डेटाबेस से लिस्ट लाएं
    });

    // --- बैक बटन (वापस डैशबोर्ड पर) ---
    document.getElementById('back-to-dash')?.addEventListener('click', () => {
        showPage('page-dashboard');
    });

    // --- प्रोफाइल बटन (अभी के लिए सिर्फ मैसेज) ---
    document.getElementById('btn-goto-profile')?.addEventListener('click', () => {
        alert("प्रोफाइल फॉर्म जल्द ही चालू होगा!");
    });
});
