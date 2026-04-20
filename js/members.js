import { showPage, toggleLoader } from './ui.js';
import { login, logout, checkAuthState } from './auth.js';
import { db, auth } from './firebase-config.js';
import { doc, setDoc, collection, onSnapshot, query, getDocs, updateDoc, increment } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
    toggleLoader(true);
    checkAuthState();

    // --- 1. भाषा बदलने का लॉजिक ---
    let currentLang = 'hi';
    const langBtn = document.getElementById('lang-toggle');
    langBtn?.addEventListener('click', () => {
        currentLang = currentLang === 'hi' ? 'en' : 'hi';
        langBtn.innerText = currentLang === 'hi' ? 'English' : 'Hindi';
        document.querySelectorAll('[data-hi]').forEach(el => {
            el.innerText = el.getAttribute(`data-${currentLang}`);
        });
    });

    // --- 2. फोटो कंप्रेसर (300px + Auto-Resize) ---
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
                document.getElementById('photo-preview').innerHTML = `<img src="${compressedPhoto}" style="width:100%; height:100%; object-fit:cover;">`;
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
            role: 'member',
            createdAt: new Date()
        };

        if (!data.name || !compressedPhoto) return alert("कृपया फोटो और नाम भरें!");

        toggleLoader(true);
        try {
            await setDoc(doc(db, "users", auth.currentUser.uid), data);
            // रेफरल देने वाले का काउंट बढ़ाएं (यदि लिंक से आया है)
            const urlParams = new URLSearchParams(window.location.search);
            const refUID = urlParams.get('ref');
            if(refUID) {
                await updateDoc(doc(db, "users", refUID), { referralCount: increment(1) });
            }
            location.reload();
        } catch (e) { alert("Error: " + e.message); toggleLoader(false); }
    });

    // --- 4. रियल-टाइम नोटिस बोर्ड (Admin Control) ---
    onSnapshot(doc(db, "settings", "notice"), (doc) => {
        if (doc.exists()) {
            const data = doc.data();
            const imgCont = document.getElementById('notice-img-cont');
            const textCont = document.getElementById('notice-text-cont');
            if(imgCont) imgCont.innerHTML = data.img ? `<img src="${data.img}" style="width:100%;">` : '';
            if(textCont) textCont.innerText = data.msg || '';
        }
    });

    // --- 5. सदस्य सूची (Privacy: No Number) ---
    const loadMembersList = async () => {
        const container = document.getElementById('members-list-container');
        container.innerHTML = "<div style='text-align:center; padding:20px;'>खोज जारी है...</div>";
        const snap = await getDocs(collection(db, "users"));
        container.innerHTML = "";
        snap.forEach(doc => {
            const u = doc.data();
            if(!u.name) return;
            const card = `
                <div class="member-card" onclick="showMemberDetail('${doc.id}')">
                    <img src="${u.photo || 'logo.png'}" class="m-img">
                    <div class="m-info">
                        <strong>${u.name}</strong>
                        <span>${u.profession} | ${u.city}</span>
                    </div>
                    <i class="fa-solid fa-chevron-right" style="color:#ccc;"></i>
                </div>`;
            container.insertAdjacentHTML('beforeend', card);
        });
    };

    // --- 6. प्राइवेसी पॉप-अप (Modal: No Number) ---
    window.showMemberDetail = async (uid) => {
        toggleLoader(true);
        const snap = await getDocs(collection(db, "users"));
        const user = snap.docs.find(d => d.id === uid)?.data();
        if (user) {
            document.getElementById('modal-body').innerHTML = `
                <h3>${user.name}</h3>
                <div class="modal-detail"><span class="modal-label">पिता:</span> <span>${user.father || '-'}</span></div>
                <div class="modal-detail"><span class="modal-label">पेशा:</span> <span>${user.profession || '-'}</span></div>
                <div class="modal-detail"><span class="modal-label">गोत्र:</span> <span>${user.gotra || '-'}</span></div>
                <div class="modal-detail"><span class="modal-label">ब्लड ग्रुप:</span> <span>${user.blood || '-'}</span></div>
                <div class="modal-detail"><span class="modal-label">उम्र:</span> <span>${user.age || '-'}</span></div>
                <div class="modal-detail"><span class="modal-label">शहर:</span> <span>${user.city || '-'}</span></div>
                <div class="modal-detail"><span class="modal-label">स्थायी पता:</span> <span>${user.address || '-'}</span></div>
                <p style="color:red; font-size:11px; margin-top:15px; text-align:center;">सुरक्षा कारणों से मोबाइल नंबर गोपनीय है।</p>
            `;
            document.getElementById('member-modal').style.display = 'block';
        }
        toggleLoader(false);
    };

    // --- 7. एडमिन नोटिस पब्लिशर ---
    document.getElementById('btn-publish-notice')?.addEventListener('click', async () => {
        const msg = document.getElementById('notice-msg').value;
        const fileInput = document.getElementById('notice-upload');
        let imgBase64 = "";

        toggleLoader(true);
        if (fileInput.files[0]) {
            const reader = new FileReader();
            reader.readAsDataURL(fileInput.files[0]);
            reader.onload = async (e) => {
                imgBase64 = e.target.result;
                await setDoc(doc(db, "settings", "notice"), { msg, img: imgBase64, date: new Date() });
                alert("नोटिस पब्लिश हुआ!");
                toggleLoader(false);
            };
        } else {
            await setDoc(doc(db, "settings", "notice"), { msg, img: "", date: new Date() });
            alert("नोटिस पब्लिश हुआ!");
            toggleLoader(false);
        }
    });

    // --- इवेंट लिस्टनर्स ---
    document.getElementById('login-btn')?.addEventListener('click', login);
    document.getElementById('logout-btn')?.addEventListener('click', logout);
    document.getElementById('close-modal')?.addEventListener('click', () => document.getElementById('member-modal').style.display = 'none');
    document.getElementById('btn-goto-members')?.addEventListener('click', () => { showPage('page-members'); loadMembersList(); });
    document.getElementById('back-to-dash')?.addEventListener('click', () => showPage('page-dashboard'));
    document.getElementById('btn-admin-panel')?.addEventListener('click', () => showPage('page-admin'));
    document.getElementById('admin-to-dash')?.addEventListener('click', () => showPage('page-dashboard'));
    
    // रेफरल शेयर लिंक
    document.getElementById('btn-share-ref')?.addEventListener('click', () => {
        const refLink = `${window.location.origin}${window.location.pathname}?ref=${auth.currentUser.uid}`;
        const text = `जय श्री राम! क्षत्रिय परिचायक ऐप से जुड़ने के लिए मेरे लिंक का उपयोग करें: ${refLink}`;
        if (navigator.share) {
            navigator.share({ title: 'Rajput App', text: text, url: refLink });
        } else {
            prompt("लिंक कॉपी करें:", refLink);
        }
    });
});
