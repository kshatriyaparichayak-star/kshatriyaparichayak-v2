/**
 * Rajput App - Admin Master Control (Final & Optimized)
 * File: js/admin.js
 */

import { db, auth } from './firebase-config.js';
import { 
    collection, getDocs, doc, deleteDoc, updateDoc, setDoc, query, orderBy 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { toggleLoader } from './ui.js';

/**
 * 1. सदस्य प्रबंधन (सर्च और डिलीट के साथ)
 * इसे login के बाद या Admin Panel खोलने पर कॉल करें
 */
export async function loadAdminUserList(searchQuery = "") {
    const listContainer = document.getElementById('admin-user-list');
    if (!listContainer) return;

    try {
        const snap = await getDocs(query(collection(db, "users"), orderBy("createdAt", "desc")));
        listContainer.innerHTML = ""; // पुराना डेटा साफ करें

        let count = 0;
        snap.forEach(userDoc => {
            const u = userDoc.data();
            
            // सर्च फिल्टर: नाम या शहर से मेल खाना चाहिए
            if (searchQuery && 
                !u.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
                !u.city.toLowerCase().includes(searchQuery.toLowerCase())) {
                return;
            }

            count++;
            const isPending = u.isApproved === false;
            
            const userRow = `
                <div class="admin-member-row" style="border-left: 4px solid ${isPending ? '#f39c12' : '#27ae60'};">
                    <div class="admin-member-info">
                        <strong>${u.name}</strong> ${isPending ? '<span style="color:#f39c12; font-size:10px;">[WAITLIST]</span>' : ''}<br>
                        <small>${u.city} | ${u.gotra || 'गोत्र उपलब्ध नहीं'}</small>
                    </div>
                    <div class="admin-actions">
                        ${isPending ? 
                            `<button onclick="window.approveMember('${userDoc.id}')" title="Approve" style="color:#27ae60; background:none; border:none; font-size:20px; cursor:pointer;"><i class="fa-solid fa-check-circle"></i></button>` : ''
                        }
                        <button onclick="window.deleteMember('${userDoc.id}')" title="Delete" style="color:#e74c3c; background:none; border:none; font-size:18px; cursor:pointer; margin-left:10px;">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </div>
                </div>
            `;
            listContainer.insertAdjacentHTML('beforeend', userRow);
        });

        if(count === 0) listContainer.innerHTML = "<p style='font-size:12px; color:#888; text-align:center;'>कोई सदस्य नहीं मिला।</p>";

    } catch (e) {
        console.error("Admin Load Error:", e);
    }
}

/**
 * 2. सदस्य को अप्रूव करना
 */
window.approveMember = async (uid) => {
    if (confirm("क्या आप इस योद्धा को समाज की मुख्य सूची में शामिल करना चाहते हैं?")) {
        toggleLoader(true);
        try {
            await updateDoc(doc(db, "users", uid), {
                isApproved: true,
                approvedAt: new Date().toISOString()
            });
            alert("सदस्य अप्रूव हो गया!");
            loadAdminUserList(document.getElementById('admin-search-input')?.value);
        } catch (e) {
            alert("Error: " + e.message);
        } finally {
            toggleLoader(false);
        }
    }
};

/**
 * 3. सदस्य को डिलीट करना (Admin Power)
 */
window.deleteMember = async (uid) => {
    if (confirm("सावधान! क्या आप इस प्रोफाइल को हमेशा के लिए डिलीट करना चाहते हैं? यह वापस नहीं आएगा।")) {
        toggleLoader(true);
        try {
            await deleteDoc(doc(db, "users", uid));
            alert("प्रोफाइल सफलतापूर्वक हटा दी गई है।");
            loadAdminUserList(document.getElementById('admin-search-input')?.value);
        } catch (e) {
            alert("Delete Error: " + e.message);
        } finally {
            toggleLoader(false);
        }
    }
};

/**
 * 4. नोटिस पब्लिश करना (Admin Direct Notice)
 */
export async function publishAdminNotice() {
    const msg = document.getElementById('notice-msg').value.trim();
    if (!msg) return alert("कृपया संदेश लिखें!");

    toggleLoader(true);
    try {
        await setDoc(doc(db, "settings", "notice"), {
            msg: msg,
            date: new Date().toISOString(),
            type: "admin_notice"
        });
        alert("सूचना पब्लिश कर दी गई है!");
        document.getElementById('notice-msg').value = "";
    } catch (e) {
        alert("Notice Error: " + e.message);
    } finally {
        toggleLoader(false);
    }
}

// Event Binding
window.addEventListener('DOMContentLoaded', () => {
    document.getElementById('btn-publish-notice')?.addEventListener('click', publishAdminNotice);
    
    // सर्च इनपुट पर लिसनर
    const searchInput = document.getElementById('admin-search-input');
    if (searchInput) {
        searchInput.oninput = (e) => loadAdminUserList(e.target.value);
    }
});
