/**
 * Rajput App - Main Logic & Event Listeners (Final & Optimized)
 * File: js/main.js
 */

import { showPage, toggleLoader, openQRModal, closeQRModal } from './ui.js';
import { login, logout, checkAuthState, saveProfile } from './auth.js';
import { db, auth } from './firebase-config.js';
import { loadAdminUserList } from './admin.js'; // एडमिन फंक्शन इम्पोर्ट
import { 
    doc, collection, onSnapshot, getDocs, 
    updateDoc, increment, setDoc, Timestamp, query, orderBy 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
    toggleLoader(true);
    checkAuthState();

    // --- 1. फोटो हैंडलिंग (Compression & Preview) ---
    let selectedPhotoFile = null;
    document.getElementById('p-photo')?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        selectedPhotoFile = file;
        const reader = new FileReader();
        reader.onload = (event) => {
            const preview = document.getElementById('photo-preview');
            if(preview) preview.innerHTML = `<img src="${event.target.result}" style="width:100%; height:100%; object-fit:cover;">`;
        };
        reader.readAsDataURL(file);
    });

    // --- 2. प्रोफाइल सुरक्षित करें (Invisible Admin Protection) ---
    document.getElementById('btn-save-profile')?.addEventListener('click', async () => {
        const profileData = {
            name: document.getElementById('p-name').value.trim(),
            father: document.getElementById('p-father').value.trim(),
            city: document.getElementById('p-city').value.trim(),
            gotra: document.getElementById('p-gotra').value.trim()
        };

        if (!profileData.name || !selectedPhotoFile) {
            return alert("प्रणाम योद्धा! कृपया अपना नाम और फोटो अनिवार्य रूप से जोड़ें।");
        }

        await saveProfile(profileData, selectedPhotoFile);
    });

    // --- 3. Emergency Alert (केवल मेंबर्स के लिए) ---
    document.getElementById('btn-send-alert')?.addEventListener('click', async () => {
        const alertMsg = document.getElementById('alert-input').value.trim();
        if (!alertMsg) return alert("कृपया आपातकालीन सूचना लिखें!");

        toggleLoader(true);
        try {
            const alertId = `alert_${Date.now()}`;
            await setDoc(doc(db, "emergency_alerts", alertId), {
                msg: alertMsg,
                sender: auth.currentUser.displayName || "Anonymous",
                timestamp: Timestamp.now()
            });
            alert("सूचना पब्लिश हुई! यह समाज के सभी सदस्यों को दिखेगी।");
            document.getElementById('alert-input').value = "";
        } catch (e) {
            console.error(e);
        } finally {
            toggleLoader(false);
        }
    });

    // --- 4. रियल-टाइम नोटिस बोर्ड (Admin Controlled) ---
    onSnapshot(doc(db, "settings", "notice"), (docSnap) => {
        const container = document.getElementById('main-notice-board');
        if (docSnap.exists() && container) {
            const data = docSnap.data();
            container.innerHTML = `
                <div class="notice-content">
                    <p>${data.msg || 'कोई नई सूचना नहीं है।'}</p>
                    <small style="display:block; margin-top:10px; font-size:10px; color:#888;">
                        पब्लिश: ${data.date ? new Date(data.date).toLocaleDateString() : 'आज'}
                    </small>
                </div>
            `;
        }
    });

    // --- 5. सदस्य सूची लोड करना ---
    const loadMembersList = async () => {
        const container = document.getElementById('members-list-container');
        if (!container) return;
        
        container.innerHTML = "<p style='text-align:center; padding:20px;'>क्षत्रिय योद्धाओं की खोज जारी है...</p>";
        // केवल अप्रूव्ड मेंबर्स ही दिखेंगे
        const snap = await getDocs(query(collection(db, "users"), orderBy("name", "asc")));
        container.innerHTML = "";

        snap.forEach(docSnap => {
            const u = docSnap.data();
            if (!u.isApproved) return; // जब तक एडमिन अप्रूव न करे, न दिखे

            const card = `
                <div class="f-card" style="margin-bottom:10px; display:flex; align-items:center; text-align:left; padding:10px; gap:15px;">
                    <img src="${u.photoURL}" style="width:50px; height:50px; border-radius:50%; object-fit:cover; border:2px solid var(--gold);">
                    <div>
                        <strong style="font-size:14px;">${u.name}</strong><br>
                        <small style="color:#666;">${u.city} | ${u.gotra}</small>
                    </div>
                </div>`;
            container.insertAdjacentHTML('beforeend', card);
        });
    };

    // --- 6. इवेंट बाइंडिंग (Buttons) ---
    document.getElementById('login-btn')?.addEventListener('click', login);
    document.getElementById('logout-btn')?.addEventListener('click', logout);
    
    document.getElementById('btn-goto-members')?.addEventListener('click', () => {
        showPage('page-members');
        loadMembersList();
    });

    document.getElementById('btn-admin-panel')?.addEventListener('click', () => {
        showPage('page-admin');
        loadAdminUserList(); // admin.js का फंक्शन
    });

    document.getElementById('admin-to-dash')?.addEventListener('click', () => showPage('page-dashboard'));
    document.getElementById('back-to-dash')?.addEventListener('click', () => showPage('page-dashboard'));

    // ग्लोबल एक्सेस (Modal)
    window.openQRModal = openQRModal;
    window.closeQRModal = closeQRModal;
});
