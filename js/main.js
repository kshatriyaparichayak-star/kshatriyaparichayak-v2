import { showPage } from './ui.js';
import { login, checkAuthState } from './auth.js';

document.addEventListener('DOMContentLoaded', () => {
    // 1. चेक करें कि यूज़र पहले से लॉगिन तो नहीं है
    checkAuthState();

    // 2. लॉगिन बटन पर क्लिक का काम सेट करें
    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) {
        loginBtn.addEventListener('click', login);
    }
});
