import { showPage, toggleLoader } from './ui.js';
import { login, logout, checkAuthState } from './auth.js'; // logout को यहाँ जोड़ा गया है
import { loadMembers } from './members.js';

document.addEventListener('DOMContentLoaded', () => {
    // 1. ऐप खुलते ही लोडर दिखाएं और चेक करें यूज़र लॉगिन है या नहीं
    toggleLoader(true); 
    checkAuthState();   

    // --- लॉगिन बटन ---
    document.getElementById('login-btn')?.addEventListener('click', () => {
        toggleLoader(true);
        login();
    });

    // --- लॉगआउट बटन (Header में जो है) ---
    document.getElementById('logout-btn')?.addEventListener('click', () => {
        if(confirm("क्या आप लॉगआउट करना चाहते हैं?")) {
            toggleLoader(true);
            logout();
        }
    });

    // --- सदस्य सूची बटन ---
    document.getElementById('btn-goto-members')?.addEventListener('click', () => {
        showPage('page-members'); 
        loadMembers();            
    });

    // --- बैक बटन (वापस डैशबोर्ड पर) ---
    document.getElementById('back-to-dash')?.addEventListener('click', () => {
        showPage('page-dashboard');
    });

    // --- प्रोफाइल बटन (अभी के लिए सिर्फ मैसेज) ---
    document.getElementById('btn-goto-profile')?.addEventListener('click', () => {
        alert("अपनी जानकारी अपडेट करने का विकल्प जल्द ही चालू होगा!");
    });
    
    // --- एडमिन बटन (अभी के लिए मैसेज) ---
    document.getElementById('btn-goto-admin')?.addEventListener('click', () => {
        alert("यह केवल एडमिन के लिए है!");
    });
});
