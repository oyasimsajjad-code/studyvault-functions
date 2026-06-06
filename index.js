const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');

admin.initializeApp();

const app = express();
app.use(cors());
app.use(express.json());

app.post('/sendPushNotification', async (req, res) => {
    const { toUid, title, body } = req.body;
    if (!toUid) return res.status(400).json({ error: 'toUid required' });

    try {
        const tokenDoc = await admin.firestore()
            .collection('fcmTokens').doc(toUid).get();

        if (!tokenDoc.exists) return res.status(404).json({ error: 'Token not found' });

        const fcmToken = tokenDoc.data().token;

        await admin.messaging().send({
            token: fcmToken,
            notification: { title, body },
            webpush: {
                notification: {
                    title, body,
                    icon: 'https://ui-avatars.com/api/?name=SV&background=7000ff&color=fff&size=64'
                }
            }
        });

        res.json({ success: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server running on port', PORT));
