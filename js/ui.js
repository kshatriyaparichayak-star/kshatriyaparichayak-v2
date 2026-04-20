// पेजों को बदलने वाला फंक्शन
export function showPage(pageId) {
    // 1. पहले सभी पेजों को छिपाएं
    const pages = document.querySelectorAll('.app-page');
    pages.forEach(p => p.classList.remove('active'));

    // 2. फिर सिर्फ उस पेज को दिखाएं जिसकी ID दी गई है
    const target = document.getElementById(pageId);
    if (target) {
        target.classList.add('active');
    }

    // 3. हेडर को संभालना (लॉगिन पेज पर हेडर नहीं दिखना चाहिए)
    const header = document.getElementById('app-header');
    if (pageId === 'page-login') {
        header.style.display = 'none';
    } else {
        header.style.display = 'flex';
    }
}

// लोडिंग स्पिनर को चालू/बंद करना
export function toggleLoader(show) {
    const loader = document.getElementById('loader');
    loader.style.display = show ? 'flex' : 'none';
}
