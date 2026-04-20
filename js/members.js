import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { db } from "./firebase-config.js"; // सीधा कॉन्फ़िग से आ रहा है

export async function loadMembers() {
    const container = document.getElementById('members-list-container');
    
    // लोड होने के दौरान मैसेज दिखाएं
    container.innerHTML = '<div style="padding:20px; text-align:center;">खोज जारी है...</div>';

    try {
        const querySnapshot = await getDocs(collection(db, "members"));
        container.innerHTML = ""; 

        if (querySnapshot.empty) {
            container.innerHTML = "<div style='padding:20px; text-align:center;'>अभी कोई सदस्य नहीं जुड़ा है।</div>";
            return;
        }

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const card = `
                <div class="member-card-new" style="background:white; margin:10px; padding:15px; border-radius:12px; border-left:6px solid #8B0000; display:flex; justify-content:space-between; align-items:center; box-shadow: 0 4px 8px rgba(0,0,0,0.06);">
                    <div style="text-align:left;">
                        <strong style="display:block; color:#8B0000; font-size:17px; margin-bottom:4px;">${data.name || 'क्षत्रिय सदस्य'}</strong>
                        <div style="color:#666; font-size:14px;">
                            <i class="fa-solid fa-location-dot" style="font-size:12px;"></i> ${data.district || 'जिला उपलब्ध नहीं'}
                        </div>
                    </div>
                    <a href="tel:${data.phone || ''}" style="background:#e8f5e9; color:#2e7d32; width:45px; height:45px; border-radius:50%; display:flex; justify-content:center; align-items:center; text-decoration:none;">
                        <i class="fa-solid fa-phone"></i>
                    </a>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', card);
        });
    } catch (e) {
        container.innerHTML = "<div style='padding:20px; color:red; text-align:center;'>डेटाबेस से संपर्क नहीं हो पाया।</div>";
        console.error("Firestore Error:", e);
    }
}
