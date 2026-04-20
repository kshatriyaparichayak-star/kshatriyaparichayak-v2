import { showPage, toggleLoader } from './ui.js';
import { login, logout, checkAuthState } from './auth.js';
import { db, auth } from './firebase-config.js';
import { doc, setDoc, collection, onSnapshot, query, orderBy, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
    toggleLoader(true);
    checkAuthState();

    // --- 1. भाषा बदलने का लॉजिक (Hindi/English) ---
    let currentLang = 'hi';
    const langBtn = document.getElementById('lang-toggle');
    langBtn?.addEventListener('click', () => {
        currentLang = currentLang === 'hi' ? 'en' : 'hi';
        langBtn.innerText = currentLang === 'hi' ? 'English' : 'Hindi';
        
        document.querySelectorAll('[data-hi]').forEach(el => {
            el.innerText = el.getAttribute(`data-${currentLang}`);
        });
    });

    // --- 2. फोटो कंप्रेसर (Resize to 300px) ---
    let compressedPhoto = "";
    document.getElementById('p-photo')?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const scale = 300 / img.width;
                canvas.width = 300;
                canvas.height = img.height * scale;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                compressedPhoto = canvas.toDataURL('image/jpeg', 0.7);
                document.getElementById('photo-preview').innerHTML = `<img src="${compressedPhoto}">`;
            };
        };
        reader.readAsDataURL(file);
    });

    // --- 3. प्रोफाइल सुरक्षित करें ---
    document.getElementById('btn-save-profile')?.addEventListener('click', async () => {
        const data = {
            name: document.getElementById('p-name').value,
            father: document.getElementById('p-father').value,
            age: document.getElementById('p-age').value,
            gotra: document.getElementById('p-gotra').value,
            blood: document.getElementById('p-blood').value,
            profession: document.getElementById('p-profession').value,
            city: document.getElementById('p-city').value,
            address: document.getElementById('p-address').value,
            photo: compressedPhoto,
            referralCount: 0,
            createdAt: new Date()
        };

        if (!data.name || !compressedPhoto) return alert("नाम और फोटो आवश्यक है!");

        toggleLoader(true);
        try {
            await setDoc(doc(db, "users", auth.currentUser.uid), data);
            location.reload();
        } catch (e) { alert("Error: " + e.message); toggleLoader(false); }
    });

    // --- 4. रियल-टाइम नोटिस बोर्ड ---
    onSnapshot(doc(db, "settings", "notice"), (doc) => {
        if (doc.exists()) {
            const data = doc.data();
            document.getElementById('notice-img-cont').innerHTML = data.img ? `<img src="${data.img}">` : '';
            document.getElementById('notice-text-cont').innerText = data.msg || '';
        }
    });

    // --- 5. सदस्य सूची और प्राइवेसी पॉप-अप ---
    window.showMemberDetail = async (uid) => {
        toggleLoader(true);
        const snap = await getDocs(query(collection(db, "users")));
        const user = snap.docs.find(d => d.id === uid)?.data();
        if (user) {
            document.getElementById('modal-body').innerHTML = `
                <h3>${user.name}</h3>
                <div class="modal-detail"><span class="modal-label">पिता:</span> <span>${user.father}</span></div>
                <div class="modal-detail"><span class="modal-label">पेशा:</span> <span>${user.profession}</span></div>
                <div class="modal-detail"><span class="modal-label">गोत्र:</span> <span>${user.gotra}</span></div>
                <div class="modal-detail"><span class="modal-label">ब्लड ग्रुप:</span> <span>${user.blood}</span></div>
                <div class="modal-detail"><span class="modal-label">उम्र:</span> <span>${user.age}</span></div>
                <div class="modal-detail"><span class="modal-label">पता:</span> <span>${user.address}</span></div>
            `;
            document.getElementById('member-modal').style.display = 'block';
        }
        toggleLoader(false);
    };

    // --- 6. स्टेटिक पेज डेटा (About/Privacy etc) ---
    window.showStaticPage = (type) => {
        const pages = {
            about: { t: "About Us", c: "यह क्षत्रिय समाज का डिजिटल मंच है..." },
            privacy: { t: "Privacy Policy", c: "हम आपकी गोपनीयता का सम्मान करते हैं। मोबाइल नंबर सुरक्षित रखे जाते हैं..." },
            terms: { t: "Terms & Conditions", c: "इस ऐप का उपयोग केवल समाज के उत्थान के लिए करें..." },
            contact: { t: "Contact Us", c: "ईमेल: kshatriyaparichayak@gmail.com" }
        };
        document.getElementById('static-title').innerText = pages[type].t;
        document.getElementById('static-content').innerText = pages[type].c;
        showPage('page-static');
    };

    // --- इवेंट लिस्टनर्स ---
    document.getElementById('login-btn')?.addEventListener('click', login);
    document.getElementById('logout-btn')?.addEventListener('click', logout);
    document.getElementById('close-modal')?.addEventListener('click', () => {
        document.getElementById('member-modal').style.display = 'none';
    });
    
    // सदस्य सूची लोड करना
    document.getElementById('btn-goto-members')?.addEventListener('click', async () => {
        showPage('page-members');
        const container = document.getElementById('members-list-container');
        container.innerHTML = "लोड हो रहा है...";
        const snap = await getDocs(collection(db, "users"));
        container.innerHTML = "";
        snap.forEach(doc => {
            const u = doc.data();
            const card = `
                <div class="member-card" onclick="showMemberDetail('${doc.id}')">
                    <img src="${u.photo || 'logo.png'}" class="m-img">
                    <div class="m-info">
                        <strong>${u.name}</strong>
                        <span>${u.profession} | ${u.city}</span>
                    </div>
                </div>`;
            container.insertAdjacentHTML('beforeend', card);
        });
    });

    document.getElementById('back-to-dash')?.addEventListener('click', () => showPage('page-dashboard'));
    document.getElementById('btn-admin-panel')?.addEventListener('click', () => showPage('page-admin'));
    document.getElementById('admin-to-dash')?.addEventListener('click', () => showPage('page-dashboard'));
});
