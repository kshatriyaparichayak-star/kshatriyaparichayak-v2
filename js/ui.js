// पेजों को बदलने वाला फंक्शन
export function showPage(pageId) {
    // 1. सभी पेजों से 'active' क्लास हटाएँ
    const pages = document.querySelectorAll('.app-page');
    pages.forEach(p => p.classList.remove('active'));

    // 2. टारगेट पेज को दिखाएँ
    const target = document.getElementById(pageId);
    if (target) {
        target.classList.add('active');
    } else {
        console.error("Page ID not found:", pageId);
    }

    // 3. हेडर (Header) मैनेजमेंट
    const header = document.getElementById('app-header');
    if (header) {
        // लॉगिन पेज पर हेडर छिपाएं, बाकी सब पर दिखाएं
        header.style.display = (pageId === 'page-login') ? 'none' : 'flex';
    }
    
    // पेज खुलते ही लोडर बंद करें
    toggleLoader(false);
    
    // पेज के टॉप पर स्क्रॉल करें
    window.scrollTo(0, 0);
}

// लोडिंग स्पिनर को कंट्रोल करने वाला फंक्शन
export function toggleLoader(show) {
    const loader = document.getElementById('loader');
    if (loader) {
        loader.style.display = show ? 'flex' : 'none';
    }
}
