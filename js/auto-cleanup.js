/**
 * Rajput App - Smart Auto-Cleanup Logic
 * Rules: Emergency Alerts (24 Hours) | Notices (21 Days)
 * File: js/auto-cleanup.js
 */

import { db } from './firebase-config.js';
import { 
    collection, 
    query, 
    where, 
    getDocs, 
    deleteDoc, 
    doc, 
    Timestamp 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/**
 * डेटाबेस से पुराने डेटा को साफ़ करने वाला मास्टर फंक्शन
 */
export async function runAutoCleanup() {
    console.log("Auto-Cleanup: जाँच शुरू हो रही है...");

    const now = Date.now();

    try {
        // --- 1. Emergency Alerts साफ़ करें (Limit: 24 Hours) ---
        const alertsRef = collection(db, "emergency_alerts");
        const alertsSnap = await getDocs(alertsRef);
        
        let deletedAlertsCount = 0;
        alertsSnap.forEach(async (docSnap) => {
            const data = docSnap.data();
            // यदि वर्तमान समय 'expiresAt' से ज्यादा है, तो डिलीट करें
            if (data.expiresAt && now > data.expiresAt) {
                await deleteDoc(doc(db, "emergency_alerts", docSnap.id));
                deletedAlertsCount++;
            }
        });

        // --- 2. Notices साफ़ करें (Limit: 21 Days) ---
        const noticesRef = collection(db, "settings");
        // यहाँ हम केवल 'notice' नाम के डॉक्यूमेंट को चेक करेंगे
        const noticeSnap = await getDocs(query(collection(db, "settings"), where("__name__", "==", "notice")));
        
        noticeSnap.forEach(async (docSnap) => {
            const data = docSnap.data();
            if (data.date) {
                const noticeDate = data.date.toMillis();
                const twentyOneDaysInMs = 21 * 24 * 60 * 60 * 1000;
                
                if (now - noticeDate > twentyOneDaysInMs) {
                    // नोटिस पुराना हो गया है, इसे डिफ़ॉल्ट/खाली कर दें या डिलीट करें
                    await updateDoc(doc(db, "settings", "notice"), {
                        msg: "कोई नई सूचना नहीं है।",
                        img: "",
                        date: null
                    });
                    console.log("Auto-Cleanup: पुराना नोटिस हटा दिया गया।");
                }
            }
        });

        if (deletedAlertsCount > 0) {
            console.log(`Auto-Cleanup: ${deletedAlertsCount} पुराने अलर्ट्स हटा दिए गए।`);
        }
        
    } catch (error) {
        console.error("Auto-Cleanup Error:", error);
    }
}

/**
 * सुरक्षा डिस्क्लेमर अपडेटर
 * हर अलर्ट के नीचे एडमिन की जिम्मेदारी न होने का संदेश पक्का करना
 */
export function applyAlertDisclaimer(alertElement) {
    const disclaimer = document.createElement('p');
    disclaimer.style.fontSize = '10px';
    disclaimer.style.color = 'red';
    disclaimer.style.marginTop = '5px';
    disclaimer.innerText = "नोट: इस सूचना की जिम्मेदारी एडमिन की नहीं है।";
    alertElement.appendChild(disclaimer);
}

// ऐप शुरू होते ही क्लीनअप चलाएँ
runAutoCleanup();
