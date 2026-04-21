/**
 * Rajput App - Members Logic (Directory & Privacy)
 * File: js/members.js
 */

import { db } from './firebase-config.js';
import { collection, getDocs, doc, query, where, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { toggleLoader } from './ui.js';

/**
 * 1. स्वीकृत सदस्य सूची लोड करना (Privacy Protected)
 */
export async function loadApprovedMembers(searchQuery = "") {
    const container = document.getElementById('members-list-container');
    if (!container) return;

    container.innerHTML = "<div style='text-align:center; padding:20px;'>क्षत्रिय योद्धाओं की खोज जारी है...</div>";

    try {
        // नियम: केवल एडमिन द्वारा अप्रूव्ड सदस्य ही दिखेंगे
        const membersQuery = query(
            collection(db, "users"),
            where("isApproved", "==", true),
            orderBy("name", "asc")
        );

        const snap = await getDocs(membersQuery);
        container.innerHTML = "";
        let count = 0;

        snap.forEach(docSnap => {
            const u = docSnap.data();
            
            // सर्च फिल्टर (नाम, शहर या गोत्र)
            if (searchQuery && 
                !u.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
                !u.city.toLowerCase().includes(searchQuery.toLowerCase()) &&
                !u.gotra.toLowerCase().includes(searchQuery.toLowerCase())) {
                return;
            }

            const card = `
                <div class="member-card" onclick="window.showMemberDetail('${docSnap.id}')">
                    <img src="${u.photoURL || u.photo || 'assets/logo.png'}" class="m-img" onerror="this.src='assets/logo.png'">
                    <div class="m-info">
                        <strong>${u.name}</strong>
                        <span>${u.profession || 'सदस्य'} | ${u.city || '-'}</span>
                        <small style="color:var(--gold); font-size:10px;">गोत्र: ${u.gotra || '-'}</small>
                    </div>
                    <i class="fa-solid fa-chevron-right" style="color:#ccc; font-size:12px;"></i>
                </div>`;
            container.insertAdjacentHTML('beforeend', card);
            count++;
        });

        if (count === 0) {
            container.innerHTML = "<p style='text-align:center; padding:20px;'>कोई सदस्य नहीं मिला।</p>";
        }

    } catch (e) {
        console.error("Load Members Error:", e);
        container.innerHTML = "<p style='text-align:center; color:red; padding:20px;'>सूची लोड करने में त्रुटि आई।</p>";
    }
}

/**
 * 2. सदस्य विवरण पॉप-अप (No Mobile Number Policy)
 */
window.showMemberDetail = async (uid) => {
    toggleLoader(true);
    try {
        const snap = await getDocs(collection(db, "users"));
        const user = snap.docs.find(d => d.id === uid)?.data();

        if (user) {
            document.getElementById('modal-body').innerHTML = `
                <div style="text-align:center; margin-bottom:15px;">
                    <img src="${user.photoURL || user.photo}" style="width:100px; height:100px; border-radius:50%; border:3px solid var(--gold); object-fit:cover;">
                </div>
                <h3 style="text-align:center; color:var(--royal-red); margin-bottom:15px;">${user.name}</h3>
                <div class="modal-detail"><strong>पिता:</strong> <span>${user.father || '-'}</span></div>
                <div class="modal-detail"><strong>पेशा:</strong> <span>${user.profession || '-'}</span></div>
                <div class="modal-detail"><strong>गोत्र:</strong> <span>${user.gotra || '-'}</span></div>
                <div class="modal-detail"><strong>ब्लड ग्रुप:</strong> <span>${user.blood || '-'}</span></div>
                <div class="modal-detail"><strong>शहर:</strong> <span>${user.city || '-'}</span></div>
                <div class="modal-detail"><strong>पता:</strong> <span>${user.address || '-'}</span></div>
                <hr style="border:0; border-top:1px solid #eee; margin:15px 0;">
                <p style="color:#c0392b; font-size:11px; text-align:center; font-weight:600;">
                    <i class="fa-solid fa-shield-halved"></i> सुरक्षा कारणों से मोबाइल नंबर गोपनीय है।
                </p>
            `;
            document.getElementById('member-modal').style.display = 'block';
        }
    } catch (e) {
        console.error("Detail Error:", e);
    } finally {
        toggleLoader(false);
    }
};
