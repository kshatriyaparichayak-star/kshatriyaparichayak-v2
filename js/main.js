import { showPage, toggleLoader } from './ui.js';
import { login, checkAuthState } from './auth.js';

document.addEventListener('DOMContentLoaded', () => {
    toggleLoader(true); // शुरू में लोडर दिखाएं
    checkAuthState();   // यूज़र की स्थिति जांचें

    // बटन क्लिक इवेंट्स
    document.getElementById('login-btn')?.addEventListener('click', () => {
        toggleLoader(true);
        login();
    });

    document.getElementById('btn-goto-members')?.addEventListener('click', () => {
        showPage('page-members');
    });

    document.getElementById('back-to-dash')?.addEventListener('click', () => {
        showPage('page-dashboard');
    });
});
