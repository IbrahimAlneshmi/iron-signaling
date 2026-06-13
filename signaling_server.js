const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: process.env.PORT || 10037 });
let pc = null, controller = null;

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        const data = JSON.parse(message);
        if (data.role === 'pc') pc = ws;
        if (data.role === 'controller') controller = ws;

        // إرسال إشارة الاستعداد فقط عندما يتوفر الطرفان
        if (pc && controller && data.role) {
            const readyMsg = JSON.stringify({ type: "peer_ready" });
            pc.send(readyMsg);
            controller.send(readyMsg);
        }

        // تمرير الرسائل (Offer/Answer/Candidate)
        if (data.role === 'pc' && controller) controller.send(message.toString());
        if (data.role === 'controller' && pc) pc.send(message.toString());
    });
    ws.on('close', () => { if (ws === pc) pc = null; if (ws === controller) controller = null; });
});
