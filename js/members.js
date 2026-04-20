import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export async function loadMembers() {
    const container = document.getElementById('members-list-container');
    container.innerHTML = '<div class="spinner-small"></div> खोजने की कोशिश जारी है...';

    try {
        const querySnapshot = await getDocs(collection(db, "members"));
        container.innerHTML = ""; // पुराना मैसेज हटाएं

        if (querySnapshot.empty) {
            container.innerHTML = "<p>कोई सदस्य नहीं मिला।</p>";
            return;
        }

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const memberCard = `
                <div class="member-card-new">
                    <div class="m-info">
                        <strong>${data.name || 'अनाम सदस्य'}</strong>
                        <span><i class="fa-solid fa-location-dot"></i> ${data.district || 'स्थान उपलब्ध नहीं'}</span>
                    </div>
                    <a href="tel:${data.phone}" class="call-btn"><i class="fa-solid fa-phone"></i></a>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', memberCard);
        });
    } catch (error) {
        console.error("Error loading members:", error);
        container.innerHTML = "<p>डेटा लोड करने में समस्या आई।</p>";
    }
}
