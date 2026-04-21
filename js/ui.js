/**
 * Rajput App - UI Routing & Interaction
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

    // हेडर मैनेजमेंट
    const header = document.getElementById('app-header');
    if (header) {
        const hideHeaderOn = ['page-login', 'page-profile-setup'];
        header.style.display = hideHeaderOn.includes(pageId) ? 'none' : 'flex';
    }
    
    // साइडबार को अपने आप बंद करें (अगर खुला हो)
    closeSidebar();
    
    toggleLoader(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 2. लोडिंग स्पिनर कंट्रोल
export function toggleLoader(show) {
    const loader = document.getElementById('loader');
    if (loader) {
        loader.style.display = show ? 'flex' : 'none';
    }
}

// 3. साइडबार (Sidebar) फंक्शन्स
export function setupSidebar() {
    const openBtn = document.getElementById('open-sidebar');
    const closeBtn = document.getElementById('close-sidebar');
    const sidebar = document.getElementById('sidebar');

    if (openBtn && sidebar) {
        openBtn.onclick = () => sidebar.classList.add('active');
    }
    if (closeBtn && sidebar) {
        closeBtn.onclick = () => sidebar.classList.remove('active');
    }
}

function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.classList.remove('active');
}

// 4. सहयोग QR मोडल (Sahyog Modal)
export function openQRModal() {
    const modal = document.getElementById('qr-modal');
    if (modal) modal.style.display = 'block';
}

export function closeQRModal() {
    const modal = document.getElementById('qr-modal');
    if (modal) modal.style.display = 'none';
}

// 5. स्टेटिक पेज लोडर (About, Privacy, etc.)
export function showStaticPage(type) {
    const titleMap = {
        'about': 'About Us',
        'terms': 'Terms & Conditions',
        'privacy': 'Privacy Policy',
        'contact': 'Contact Us',
        'faq': 'FAQ'
    };
    
    const content = document.getElementById('static-content');
    const title = document.getElementById('static-title');
    
    if (title) title.innerText = titleMap[type] || 'Information';
    
    // यहाँ आप बाद में कंटेंट अपडेट कर सकते हैं
    if (content) content.innerHTML = `<p>${titleMap[type]} का विवरण जल्द ही यहाँ उपलब्ध होगा।</p>`;
    
    showPage('page-static');
}

// इवेंट लिसनर्स सेट करें (जब DOM लोड हो जाए)
window.addEventListener('DOMContentLoaded', () => {
    setupSidebar();
    
    // मोडल के बाहर क्लिक करने पर मोडल बंद करें
    window.onclick = (event) => {
        const qrModal = document.getElementById('qr-modal');
        if (event.target == qrModal) closeQRModal();
    };
});
