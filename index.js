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
                'Authorization': 'Key j23ep7sbdeeinvu52v3efc4tv'
            },
            body: JSON.stringify({
                app_id: 'e912442b-3a96-45f2-95a7-5ac233155ca4',
                filters: [{ field: 'tag', key: 'uid', relation: '=', value: toUid }],
                headings: { en: title },
                contents: { en: body }
            })
        });
        const data = await response.json();
        res.json({ success: true, data });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server running on port', PORT));
