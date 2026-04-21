/**
 * Rajput App - Main Logic & Event Listeners
 * File: js/main.js
 */

import { showPage, toggleLoader, openQRModal, closeQRModal } from './ui.js';
import { login, logout, checkAuthState, saveProfile } from './auth.js';
import { db, auth } from './firebase-config.js';
import { 
    doc, setDoc, collection, onSnapshot, getDocs, 
    updateDoc, increment, deleteDoc, query, where, Timestamp 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
    toggleLoader(true);
    checkAuthState();

    // --- 1. फोटो हैंडलिंग (Compression & Validation) ---
    let selectedPhotoFile = null;
    document.getElementById('p-photo')?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        selectedPhotoFile = file; // auth.js में भेजने के लिए
        const reader = new FileReader();
        reader.onload = (event) => {
            document.getElementById('photo-preview').innerHTML = 
                `<img src="${event.target.result}" style="width:100%; height:100%; object-fit:cover;">`;
        };
        reader.readAsDataURL(file);
    });

    // --- 2. प्रोफाइल सुरक्षित करें (No Photo = No Entry) ---
    document.getElementById('btn-save-profile')?.addEventListener('click', async () => {
        const profileData = {
            name: document.getElementById('p-name').value.trim(),
            father: document.getElementById('p-father').value.trim(),
            age: document.getElementById('p-age').value,
            gotra: document.getElementById('p-gotra').value.trim(),
            blood: document.getElementById('p-blood').value,
            profession: document.getElementById('p-profession').value.trim(),
            city: document.getElementById('p-city').value.trim(),
            address: document.getElementById('p-address').value.trim()
        };

        if (!profileData.name || !selectedPhotoFile) {
            return alert("नाम और फोटो अनिवार्य है!");
        }

        // auth.js के saveProfile को कॉल करना (Storage + Firestore)
        await saveProfile(profileData, selectedPhotoFile);
        
        // रेफरल बोनस (यदि मौजूद हो)
        const urlParams = new URLSearchParams(window.location.search);
        const refUID = urlParams.get('ref');
        if (refUID) {
            const refRef = doc(db, "users", refUID);
            await updateDoc(refRef, { referralCount: increment(1) });
        }
    });

    // --- 3. Emergency Alert (24-Hour Logic) ---
    document.getElementById('btn-send-alert')?.addEventListener('click', async () => {
        const alertMsg = document.getElementById('alert-input').value.trim();
        if (!alertMsg) return alert("कृपया सूचना लिखें!");

        toggleLoader(true);
        try {
            const alertId = `alert_${Date.now()}`;
            await setDoc(doc(db, "emergency_alerts", alertId), {
                msg: alertMsg,
                sender: auth.currentUser.displayName,
                timestamp: Timestamp.now(),
                expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 Hours
            });
            alert("आपातकालीन अलर्ट पब्लिश हुआ!");
            document.getElementById('alert-input').value = "";
        } catch (e) {
            console.error(e);
        } finally {
            toggleLoader(false);
        }
    });

    // --- 4. रियल-टाइम नोटिस बोर्ड (Admin Controlled - 21 Days Max) ---
    onSnapshot(doc(db, "settings", "notice"), (docSnap) => {
        const container = document.getElementById('main-notice-board');
        if (docSnap.exists() && container) {
            const data = docSnap.data();
            container.innerHTML = `
                ${data.img ? `<img src="${data.img}" style="width:100%; border-radius:10px; margin-bottom:10px;">` : ''}
                <p>${data.msg || 'कोई नई सूचना नहीं है।'}</p>
                <small style="font-size:10px; color:#999;">${data.date ? new Date(data.date.seconds * 1000).toLocaleDateString() : ''}</small>
            `;
        }
    });

    // --- 5. सदस्य सूची (Privacy Focused) ---
    const loadMembersList = async () => {
        const container = document.getElementById('members-list-container');
        if (!container) return;
        
        container.innerHTML = "<div class='loader-mini'>खोज जारी है...</div>";
        const snap = await getDocs(collection(db, "users"));
        container.innerHTML = "";

        snap.forEach(docSnap => {
            const u = docSnap.data();
            if (!u.name) return;
            const card = `
                <div class="member-card" onclick="window.showMemberDetail('${docSnap.id}')">
                    <img src="${u.photoURL || 'assets/logo.png'}" class="m-img">
                    <div class="m-info">
                        <strong>${u.name}</strong>
                        <span>${u.profession || 'सदस्य'} | ${u.city || 'भारत'}</span>
                    </div>
                </div>`;
            container.insertAdjacentHTML('beforeend', card);
        });
    };

    // --- 6. सदस्य विवरण (Pop-up) ---
    window.showMemberDetail = async (uid) => {
        toggleLoader(true);
        const userSnap = await getDocs(collection(db, "users"));
        const user = userSnap.docs.find(d => d.id === uid)?.data();
        
        if (user) {
            document.getElementById('modal-body').innerHTML = `
                <img src="${user.photoURL}" style="width:100px; height:100px; border-radius:50%; margin: 0 auto 15px; display:block; border: 3px solid var(--gold);">
                <h3>${user.name}</h3>
                <div class="modal-detail"><strong>पिता:</strong> <span>${user.father || '-'}</span></div>
                <div class="modal-detail"><strong>गोत्र:</strong> <span>${user.gotra || '-'}</span></div>
                <div class="modal-detail"><strong>पेशा:</strong> <span>${user.profession || '-'}</span></div>
                <div class="modal-detail"><strong>शहर:</strong> <span>${user.city || '-'}</span></div>
                <p style="color:#c0392b; font-size:11px; margin-top:15px;">सुरक्षा नीति: मोबाइल नंबर गोपनीय है।</p>
            `;
            document.getElementById('member-modal').style.display = 'block';
        }
        toggleLoader(false);
    };

    // --- 7. इवेंट बाइंडिंग ---
    document.getElementById('login-btn')?.addEventListener('click', login);
    document.getElementById('logout-btn')?.addEventListener('click', logout);
    document.getElementById('btn-goto-members')?.addEventListener('click', () => {
        showPage('page-members');
        loadMembersList();
    });
    
    document.getElementById('btn-share-ref')?.addEventListener('click', () => {
        const refLink = `${window.location.origin}${window.location.pathname}?ref=${auth.currentUser.uid}`;
        if (navigator.share) {
            navigator.share({ title: 'Rajput App', text: 'क्षत्रिय परिचायक ऐप से जुड़ें:', url: refLink });
        } else {
            prompt("लिंक कॉपी करें:", refLink);
        }
    });

    // Sahyog Modal Buttons
    window.openQRModal = openQRModal;
    window.closeQRModal = closeQRModal;

    // Navigation Buttons
    document.getElementById('back-to-dash')?.addEventListener('click', () => showPage('page-dashboard'));
    document.getElementById('btn-admin-panel')?.addEventListener('click', () => showPage('page-admin'));
    document.getElementById('admin-to-dash')?.addEventListener('click', () => showPage('page-dashboard'));
    document.getElementById('close-modal')?.addEventListener('click', () => {
        document.getElementById('member-modal').style.display = 'none';
    });
});
