/**
 * Rajput App - UI Routing & Interaction (Final & Complete)
 * File: js/ui.js
 */

// 1. पेजों को बदलने वाला फंक्शन (Routing)
export function showPage(pageId) {
    const pages = document.querySelectorAll('.app-page');
    pages.forEach(p => {
        p.classList.remove('active');
        p.style.display = 'none';
    });

    const target = document.getElementById(pageId);
    if (target) {
        target.style.display = 'block';
        setTimeout(() => {
            target.classList.add('active');
        }, 10);
    }

    // हेडर मैनेजमेंट (लॉगिन और प्रोफाइल सेटअप पर हेडर नहीं दिखेगा)
    const header = document.getElementById('app-header');
    if (header) {
        const hideHeaderOn = ['page-login', 'page-profile-setup'];
        header.style.display = hideHeaderOn.includes(pageId) ? 'none' : 'flex';
    }
    
    // साइडबार को अपने आप बंद करें
    closeSidebar();
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 2. लोडिंग स्पिनर कंट्रोल
export function toggleLoader(show) {
    const loader = document.getElementById('loader');
    if (loader) {
        loader.style.display = show ? 'flex' : 'none';
    }
}

// 3. साइडबार फंक्शन्स
export function setupSidebar() {
    const openBtn = document.getElementById('open-sidebar');
    const closeBtn = document.getElementById('close-sidebar');
    const sidebar = document.getElementById('sidebar');

    if (openBtn) openBtn.onclick = () => sidebar.classList.add('active');
    if (closeBtn) closeBtn.onclick = () => sidebar.classList.remove('active');

    // मेन्यू लिंक्स को सक्रिय करना
    document.getElementById('menu-about').onclick = () => showStaticPage('about');
    document.getElementById('menu-terms').onclick = () => showStaticPage('terms');
    document.getElementById('menu-privacy').onclick = () => showStaticPage('privacy');
    document.getElementById('menu-contact').onclick = () => showStaticPage('contact');
    document.getElementById('menu-faq').onclick = () => showStaticPage('faq');
}

function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.classList.remove('active');
}

// 4. सहयोग QR मोडल
export function openQRModal() {
    const modal = document.getElementById('qr-modal');
    if (modal) modal.style.display = 'block';
}

export function closeQRModal() {
    const modal = document.getElementById('qr-modal');
    if (modal) modal.style.display = 'none';
}

// 5. स्टेटिक पेज लोडर (कंटेंट के साथ)
export function showStaticPage(type) {
    const titleMap = {
        'about': 'हमारे बारे में',
        'terms': 'नियम और शर्तें',
        'privacy': 'गोपनीयता नीति',
        'contact': 'संपर्क करें',
        'faq': 'FAQ'
    };
    
    const contentMap = {
        'about': `
            <div class="static-card">
                <p><b>क्षत्रिय परिचायक</b> समाज को एक सूत्र में पिरोने का एक डिजिटल मंच है।</p>
                <p>हमारा उद्देश्य समाज के प्रत्येक योद्धा की पहचान सुरक्षित करना और आपसी सहयोग को बढ़ावा देना है। यह पूर्णतः निःस्वार्थ प्रयास है।</p>
            </div>`,
        'terms': `
            <div class="static-card">
                <p>1. समाज की गरिमा बनाए रखें।</p>
                <p>2. किसी भी विवादित पोस्ट के लिए सदस्य स्वयं जिम्मेदार होगा।</p>
                <p>3. गलत जानकारी पाए जाने पर एडमिन को सदस्यता रद्द करने का पूर्ण अधिकार है।</p>
            </div>`,
        'privacy': `
            <div class="static-card">
                <p>1. आपकी व्यक्तिगत जानकारी (जैसे मोबाइल नंबर) केवल एडमिन देख सकता है।</p>
                <p>2. आपकी प्रोफाइल फोटो केवल रजिस्टर्ड मेंबर्स को ही दिखेगी।</p>
                <p>3. हम आपका डेटा किसी भी बाहरी संस्था को नहीं बेचते।</p>
            </div>`,
        'contact': `
            <div class="static-card">
                <p>सहायता या सुझाव के लिए हमें यहाँ लिखें:</p>
                <p style="color:var(--royal-red); font-weight:bold;">kshatriyaparichayak@gmail.com</p>
                <p>हम 24-48 घंटों में आपसे संपर्क करेंगे।</p>
            </div>`,
        'faq': `
            <div class="static-card">
                <p><b>Q: मेरी प्रोफाइल क्यों नहीं दिख रही?</b><br>A: एडमिन की अप्रूवल के बाद ही प्रोफाइल सार्वजनिक होती है।</p>
                <p><b>Q: क्या मैं अपना शहर बदल सकता हूँ?</b><br>A: हाँ, प्रोफाइल एडिट सेक्शन में जाकर आप बदलाव कर सकते हैं।</p>
            </div>`
    };
    
    const contentEl = document.getElementById('static-content');
    const titleEl = document.getElementById('static-title');
    
    if (titleEl) titleEl.innerText = titleMap[type] || 'Information';
    if (contentEl) contentEl.innerHTML = contentMap[type] || '<p>विवरण जल्द उपलब्ध होगा।</p>';
    
    showPage('page-static');
}

// ग्लोबल फंक्शन्स (ताकि HTML से एक्सेस हो सकें)
window.openQRModal = openQRModal;
window.closeQRModal = closeQRModal;
window.showPage = showPage;

// इवेंट लिसनर्स
window.addEventListener('DOMContentLoaded', () => {
    setupSidebar();
    window.onclick = (event) => {
        const qrModal = document.getElementById('qr-modal');
        if (event.target == qrModal) closeQRModal();
    };
});
