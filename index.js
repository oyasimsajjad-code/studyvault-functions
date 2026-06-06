const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');

const app = express();
app.use(cors());
app.use(express.json());

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
        })
    });
}

app.post('/sendPushNotification', async (req, res) => {
    const { toUid, title, body } = req.body;
    if (!toUid) return res.status(400).json({ error: 'toUid required' });
    try {
        const snap = await admin.firestore().collection('osTokens').doc(toUid).get();
        if (!snap.exists) return res.status(404).json({ error: 'No token for: ' + toUid });
        const playerId = snap.data().playerId;
        const response = await fetch('https://onesignal.com/api/v1/notifications', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Basic os_v2_app_5ejeikz2szc7ffnhllbdgfk4usj23ep7sbdeeinvu52v3efc4tvuygaeibzrmster4gku4lkuycj6mxim64mbk3i7dp2n6auyul6q5i'
            },
            body: JSON.stringify({
                app_id: 'e912442b-3a96-45f2-95a7-5ac233155ca4',
                include_player_ids: [playerId],
                headings: { en: title },
                contents: { en: body }
            })
        });
        const data = await response.json();
        console.log('OneSignal:', JSON.stringify(data));
        res.json({ success: true, data });
    } catch(e) {
        res.status(500).json({ error: e.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server on port', PORT));
