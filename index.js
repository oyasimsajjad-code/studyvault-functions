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
app.post('/api/ai', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    try {
        const { system, messages, max_tokens } = req.body;
        const contents = (messages || []).map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: typeof m.content === 'string' ? m.content : JSON.stringify(m.content) }]
        }));
        const geminiBody = {
            contents,
            generationConfig: { maxOutputTokens: max_tokens || 1000 }
        };
        if (system) geminiBody.systemInstruction = { parts: [{ text: system }] };

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
            { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(geminiBody) }
        );
        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        res.json({ content: [{ type: 'text', text }] });
    } catch (e) {
        res.status(500).json({ error: e.message, content: [{ type: 'text', text: '' }] });
    }
});
app.listen(process.env.PORT || 3000);
