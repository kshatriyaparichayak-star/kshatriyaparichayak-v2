/**
 * Rajput App - Admin Master Control
 * File: js/admin.js
 */

import { db, auth } from './firebase-config.js';
import { 
    collection, getDocs, doc, deleteDoc, updateDoc, setDoc, query, where 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { toggleLoader } from './ui.js';

/**
 * 1. एडमिन डैशबोर्ड लोड करना (Waitlist और Member List)
 */
export async function loadAdminData() {
    const waitlistContainer = document.getElementById('admin-user-list');
    if (!waitlistContainer) return;

    toggleLoader(true);
    try {
        const snap = await getDocs(collection(db, "users"));
        waitlistContainer.innerHTML = "<h4>सदस्य प्रबंधन (Waitlist & Members)</h4>";

        snap.forEach(userDoc => {
            const u = userDoc.data();
            const isPending = u.isApproved === false;

            const userRow = `
                <div class="admin-user-row" style="background:${isPending ? '#fff5f5' : '#fff'}; padding:10px; margin-bottom:10px; border-radius:10px; display:flex; justify-content:space-between; align-items:center; box-shadow:0 2px 5px rgba(0,0,0,0.05); border-left: 5px solid ${isPending ? '#e67e22' : '#27ae60'};">
                    <div style="font-size:13px;">
                        <strong>${u.name || 'Anonymous'}</strong> ${isPending ? '<b style="color:#e67e22;">(Waitlist)</b>' : ''}<br>
                        <small>${u.city || 'No City'} | Gotra: ${u.gotra || '-'}</small>
                    </div>
                    <div class="admin-actions">
                        ${isPending ? `<button onclick="approveMember('${userDoc.id}')" style="color:green; border:none; background:none; font-size:18px; cursor:pointer;"><i class="fa-solid fa-circle-check"></i></button>` : ''}
                        <button onclick="deleteMember('${userDoc.id}')" style="color:red; border:none; background:none; font-size:18px; cursor:pointer; margin-left:10px;"><i class="fa-solid fa-trash-can"></i></button>
                    </div>
                </div>
            `;
            waitlistContainer.insertAdjacentHTML('beforeend', userRow);
        });
    } catch (e) {
        console.error("Admin Load Error:", e);
    } finally {
        toggleLoader(false);
    }
}

/**
 * 2. सदस्य को अप्रूव करना (Waitlist से हटाना)
 */
window.approveMember = async (uid) => {
    if (confirm("क्या आप इस सदस्य को समाज की मुख्य सूची में शामिल करना चाहते हैं?")) {
        toggleLoader(true);
        try {
            await updateDoc(doc(db, "users", uid), {
                isApproved: true,
                approvedBy: auth.currentUser.email
            });
            alert("सदस्य को अप्रूव कर दिया गया है!");
            loadAdminData();
        } catch (e) {
            alert("Approval Error: " + e.message);
        } finally {
            toggleLoader(false);
        }
    }
};

/**
 * 3. सदस्य को डिलीट करना (Master Power)
 */
window.deleteMember = async (uid) => {
    if (confirm("सावधान! क्या आप इस प्रोफाइल को हमेशा के लिए डिलीट करना चाहते हैं?")) {
        toggleLoader(true);
        try {
            await deleteDoc(doc(db, "users", uid));
            alert("प्रोफाइल डिलीट कर दी गई है।");
            loadAdminData();
        } catch (e) {
            alert("Delete Error: " + e.message);
        } finally {
            toggleLoader(false);
        }
    }
};

/**
 * 4. एडमिन नोटिस पब्लिशर (21-Day Logic Integrated)
 */
export async function publishNotice() {
    const msg = document.getElementById('notice-msg').value.trim();
    const fileInput = document.getElementById('notice-upload');
    
    if (!msg && !fileInput.files[0]) {
        return alert("सूचना के लिए फोटो या संदेश आवश्यक है!");
    }

    toggleLoader(true);

    try {
        let imgData = "";
        if (fileInput.files[0]) {
            imgData = await compressAdminImage(fileInput.files[0]);
        }

        await setDoc(doc(db, "settings", "notice"), {
            msg: msg,
            img: imgData,
            date: new Date(), // Cleanup logic इसी तारीख को चेक करेगा
            updatedBy: auth.currentUser.email
        });

        alert("सूचना पब्लिश हुई! यह 21 दिनों तक बोर्ड पर रहेगी।");
        document.getElementById('notice-msg').value = "";
        document.getElementById('notice-upload').value = "";
    } catch (e) {
        alert("Notice Error: " + e.message);
    } finally {
        toggleLoader(false);
    }
}

/**
 * एडमिन फोटो कंप्रेसर
 */
function compressAdminImage(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (e) => {
            const img = new Image();
            img.src = e.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 600; 
                const scale = MAX_WIDTH / img.width;
                canvas.width = MAX_WIDTH;
                canvas.height = img.height * scale;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL('image/jpeg', 0.7));
            };
        };
    });
}

// Event Binding for Admin UI
document.getElementById('btn-publish-notice')?.addEventListener('click', publishNotice);
