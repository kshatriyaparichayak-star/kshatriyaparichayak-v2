import { showPage, toggleLoader } from './ui.js';
import { login, logout, checkAuthState } from './auth.js';

document.addEventListener('DOMContentLoaded', () => {
    // 1. यूज़र की लॉगिन स्थिति चेक करें
    checkAuthState();

    // --- बटन इवेंट्स (Events) ---

    // लॉगिन बटन
    document.getElementById('login-btn')?.addEventListener('click', () => {
        toggleLoader(true);
        login();
    });

    // लॉगआउट बटन (हेडर में)
    document.getElementById('logout-btn')?.addEventListener('click', () => {
        if(confirm("क्या आप लॉगआउट करना चाहते हैं?")) {
            logout();
        }
    });

    // --- डैशबोर्ड नेविगेशन (Front Page to Other Pages) ---

    // 1. सदस्य सूची पेज पर जाना
    document.getElementById('btn-goto-members')?.addEventListener('click', () => {
        showPage('page-members');
    });

    // 2. प्रोफाइल पेज पर जाना (अभी खाली है)
    document.getElementById('btn-goto-profile')?.addEventListener('click', () => {
        alert("प्रोफाइल फॉर्म जल्द ही उपलब्ध होगा!");
    });

    // 3. अलर्ट पेज पर जाना
    document.getElementById('btn-goto-alerts')?.addEventListener('click', () => {
        alert("अलर्ट सिस्टम सेटअप किया जा रहा है!");
    });

    // 4. एडमिन पेज पर जाना
    document.getElementById('btn-goto-admin')?.addEventListener('click', () => {
        showPage('page-admin');
    });

    // --- बैक बटन (Back Buttons) ---

    // सदस्य सूची से वापस डैशबोर्ड पर आना
    document.getElementById('back-to-dash')?.addEventListener('click', () => {
        showPage('page-dashboard');
    });

});
