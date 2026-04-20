}
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export async function loadMembers() {
    const container = document.getElementById('members-list-container');
    container.innerHTML = '<div style="padding:20px;">खोज जारी है...</div>';

    try {
        const querySnapshot = await getDocs(collection(db, "members"));
        container.innerHTML = ""; 

        if (querySnapshot.empty) {
            container.innerHTML = "कोई सदस्य नहीं मिला।";
            return;
        }

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const card = `
                <div class="member-card-new" style="background:white; margin:10px; padding:15px; border-radius:10px; border-left:5px solid #8B0000; display:flex; justify-content:space-between;">
                    <div>
                        <strong style="display:block; color:#8B0000;">${data.name || 'क्षत्रिय सदस्य'}</strong>
                        <small>${data.district || 'जिला उपलब्ध नहीं'}</small>
                    </div>
                    <a href="tel:${data.phone}" style="color:green; font-size:20px;"><i class="fa-solid fa-phone"></i></a>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', card);
        });
    } catch (e) {
        container.innerHTML = "डेटा लाने में त्रुटि हुई।";
        console.error(e);
    }
}
