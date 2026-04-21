/**
 * Rajput App - Private Messaging Logic
 * File: js/chat.js
 */

import { db, auth } from './firebase-config.js';
import { 
    collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/**
 * 1. मैसेज भेजने का फंक्शन
 */
export async function sendMessage(receiverUid, messageText) {
    if (!messageText.trim()) return;

    try {
        await addDoc(collection(db, "messages"), {
            senderId: auth.currentUser.uid,
            receiverId: receiverUid,
            text: messageText.trim(),
            timestamp: serverTimestamp(),
            read: false
        });
    } catch (e) {
        console.error("Chat Error:", e);
    }
}

/**
 * 2. रियल-टाइम चैट लोड करना
 */
export function loadChat(receiverUid, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const q = query(
        collection(db, "messages"),
        where("senderId", "in", [auth.currentUser.uid, receiverUid]),
        where("receiverId", "in", [auth.currentUser.uid, receiverUid]),
        orderBy("timestamp", "asc")
    );

    return onSnapshot(q, (snapshot) => {
        container.innerHTML = "";
        snapshot.forEach((doc) => {
            const msg = doc.data();
            const isMine = msg.senderId === auth.currentUser.uid;
            const msgDiv = `
                <div class="chat-msg ${isMine ? 'sent' : 'received'}" 
                     style="margin: 5px; padding: 10px; border-radius: 10px; max-width: 80%; 
                     align-self: ${isMine ? 'flex-end' : 'flex-start'};
                     background: ${isMine ? 'var(--royal-red)' : '#eee'};
                     color: ${isMine ? 'white' : 'black'};">
                    ${msg.text}
                </div>
            `;
            container.insertAdjacentHTML('beforeend', msgDiv);
        });
        container.scrollTop = container.scrollHeight; // ऑटो स्क्रॉल नीचे
    });
}
