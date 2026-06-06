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
        const tokenDoc = await admin.firestore()
            .collection('fcmTokens').doc(toUid).get();

        if (!tokenDoc.exists) return res.status(404).json({ error: 'Token not found for uid: ' + toUid });

        const fcmToken = tokenDoc.data().token;
        console.log('Sending to token:', fcmToken?.substring(0,20));

        const result = await admin.messaging().send({
            token: fcmToken,
            notification: { title, body },
            android: {
                priority: 'high',
                notification: {
                    sound: 'default',
                    channelId: 'default'
                }
            },
            webpush: {
                notification: {
                    title, body,
                    icon: 'https://ui-avatars.com/api/?name=SV&background=7000ff&color=fff&size=64'
                }
            }
        });

        res.json({ success: true, result });
    } catch (e) {
        console.error('FCM error:', e.message);
        res.status(500).json({ error: e.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server running on port', PORT));
