/**
 * क्षत्रिय परिचायक - UI Routing & Loader
 * Professional Version
 */

// पेजों को बदलने वाला फंक्शन
export function showPage(pageId) {
    // 1. सभी पेजों को छिपाएं
    const pages = document.querySelectorAll('.app-page');
    pages.forEach(p => {
        p.classList.remove('active');
        p.style.display = 'none'; // पक्का करने के लिए कि कोई और पेज न दिखे
    });

    // 2. टारगेट पेज को दिखाएँ
    const target = document.getElementById(pageId);
    if (target) {
        target.style.display = 'block';
        // हल्का सा डिले ताकि एनीमेशन सही दिखे
        setTimeout(() => {
            target.classList.add('active');
        }, 10);
    } else {
        console.error("Page ID not found:", pageId);
        // अगर पेज न मिले तो डैशबोर्ड पर भेजें (Safety Fallback)
        const dash = document.getElementById('page-dashboard');
        if(dash) dash.style.display = 'block';
    }

    // 3. हेडर (Header) मैनेजमेंट
    const header = document.getElementById('app-header');
    if (header) {
        // लॉगिन और प्रोफाइल सेटअप पेज पर हेडर छिपाएं
        const hideHeaderOn = ['page-login', 'page-profile-setup'];
        header.style.display = hideHeaderOn.includes(pageId) ? 'none' : 'flex';
    }
    
    // पेज खुलते ही लोडर बंद करें
    toggleLoader(false);
    
    // पेज के टॉप पर स्क्रॉल करें
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// लोडिंग स्पिनर को कंट्रोल करने वाला फंक्शन
export function toggleLoader(show) {
    const loader = document.getElementById('loader');
    if (loader) {
        loader.style.display = show ? 'flex' : 'none';
        
        // सुरक्षा के लिए: अगर लोडर 10 सेकंड से ज्यादा चले तो उसे बंद कर दें
        if (show) {
            setTimeout(() => {
                if (loader.style.display === 'flex') {
                    loader.style.display = 'none';
                    console.log("Loader timeout: Auto-closed.");
                }
            }, 10000);
        }
    }
}
