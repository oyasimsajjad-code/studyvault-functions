const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

app.post('/sendPushNotification', async (req, res) => {
    const { toUid, title, body } = req.body;
    if (!toUid) return res.status(400).json({ error: 'toUid required' });
    try {
        const response = await fetch('https://onesignal.com/api/v1/notifications', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Basic os_v2_app_5ejeikz2szc7ffnhllbdgfk4usj23ep7sbdeeinvu52v3efc4tvuygaeibzrmster4gku4lkuycj6mxim64mbk3i7dp2n6auyul6q5i'
            },
            body: JSON.stringify({
                app_id: 'e912442b-3a96-45f2-95a7-5ac233155ca4',
                include_aliases: { external_id: [toUid] },
                target_channel: 'push',
                headings: { en: title },
                contents: { en: body }
            })
        });
        const data = await response.json();
        res.json({ success: true, data });
    } catch(e) {
        res.status(500).json({ error: e.message });
    }
});

app.listen(process.env.PORT || 3000);
