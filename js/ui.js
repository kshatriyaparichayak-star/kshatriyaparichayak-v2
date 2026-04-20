export function showPage(pageId) {
    // पेजों को अदल-बदल करना
    document.querySelectorAll('.app-page').forEach(p => p.classList.remove('active'));
    const target = document.getElementById(pageId);
    if (target) target.classList.add('active');

    // हेडर मैनेजमेंट
    const header = document.getElementById('app-header');
    if (pageId === 'page-login') {
        header.style.display = 'none';
    } else {
        header.style.display = 'flex';
    }
    
    toggleLoader(false); // पेज खुलते ही लोडर बंद
}

export function toggleLoader(show) {
    const loader = document.getElementById('loader');
    if (loader) loader.style.display = show ? 'flex' : 'none';
}
