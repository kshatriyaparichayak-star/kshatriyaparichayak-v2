import { showPage } from './ui.js';

// जब पूरी वेबसाइट लोड हो जाए तब यह चलेगा
document.addEventListener('DOMContentLoaded', () => {
    console.log("Kshatriya Parichayak V2: Started");
    
    // ऐप शुरू होते ही सबसे पहले लॉगिन पेज दिखाएं
    showPage('page-login');
});
