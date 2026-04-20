import { db, auth } from './firebase-config.js';
import { collection, getDocs, doc, deleteDoc, updateDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { toggleLoader } from './ui.js';

/**
 * 1. सभी सदस्यों की लिस्ट लोड करना (Edit/Delete के लिए)
 */
export async function loadAdminUserList() {
    const container = document.getElementById('admin-user-list');
    if (!container) return;

    container.innerHTML = "<p style='text-align:center; padding:20px;'>सदस्यों की सूची लोड हो रही है...</p>";

    try {
        const snap = await getDocs(collection(db, "users"));
        container.innerHTML = "<h4>सभी पंजीकृत सदस्य</h4>";

        snap.forEach(userDoc => {
            const u = userDoc.data();
            const userRow = `
                <div class="admin-user-row" style="background:#fff; padding:10px; margin-bottom:10px; border-radius:10px; display:flex; justify-content:space-between; align-items:center; box-shadow:0 2px 5px rgba(0,0,0,0.05);">
                    <div style="font-size:14px;">
                        <strong>${u.name || 'No Name'}</strong><br>
                        <small>${u.city || 'No City'} | शक्ति: ${u.referralCount || 0}/11</small>
                    </div>
                    <div class="admin-actions">
                        <button onclick="deleteMember('${userDoc.id}')" style="background:none; border:none; color:red; cursor:pointer; margin-left:10px;"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', userRow);
        });
    } catch (e) {
        container.innerHTML = "सूची लोड करने में विफल।";
        console.error(e);
    }
}

/**
 * 2. सदस्य को डिलीट करना
 */
window.deleteMember = async (uid) => {
    if (confirm("क्या आप वाकई इस सदस्य को हटाना चाहते हैं? यह डेटा वापस नहीं आएगा।")) {
        toggleLoader(true);
        try {
            await deleteDoc(doc(db, "users", uid));
            alert("सदस्य को हटा दिया गया है।");
            loadAdminUserList(); // लिस्ट रिफ्रेश करें
        } catch (e) {
            alert("त्रुटि: " + e.message);
        } finally {
            toggleLoader(false);
        }
    }
};

/**
 * 3. फोटो + मैसेज वाला नोटिस पब्लिश करना
 */
export async function publishNotice() {
    const msg = document.getElementById('notice-msg').value;
    const fileInput = document.getElementById('notice-upload');
    let imgBase64 = "";

    if (!msg && !fileInput.files[0]) {
        alert("कृपया फोटो चुनें या संदेश लिखें!");
        return;
    }

    toggleLoader(true);

    try {
        if (fileInput.files[0]) {
            // फोटो कंप्रेस करके Base64 बनाना
            const file = fileInput.files[0];
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async (e) => {
                const img = new Image();
                img.src = e.target.result;
                img.onload = async () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 500; // एडमिन नोटिस फोटो थोड़ी बड़ी (500px)
                    const scale = MAX_WIDTH / img.width;
                    canvas.width = MAX_WIDTH;
                    canvas.height = img.height * scale;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    imgBase64 = canvas.toDataURL('image/jpeg', 0.7);

                    await saveNoticeToDB(msg, imgBase64);
                };
            };
        } else {
            await saveNoticeToDB(msg, "");
        }
    } catch (e) {
        alert("Notice Error: " + e.message);
        toggleLoader(false);
    }
}

async function saveNoticeToDB(msg, img) {
    try {
        await setDoc(doc(db, "settings", "notice"), {
            msg: msg,
            img: img,
            updatedBy: auth.currentUser.email,
            date: new Date()
        });
        alert("सूचना सफलतापूर्वक पब्लिश हो गई!");
        document.getElementById('notice-msg').value = "";
        document.getElementById('notice-upload').value = "";
    } catch (e) {
        alert("डेटाबेस त्रुटि: " + e.message);
    } finally {
        toggleLoader(false);
    }
}
