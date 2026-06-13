const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: process.env.PORT || 10037 });
let pc = null, controller = null;

wss.on('connection', (ws) => {
    console.log("New Connection");
    ws.on('message', (message) => {
        const data = JSON.parse(message);
        if (data.role === 'pc') pc = ws;
        if (data.role === 'controller') controller = ws;

        // إرسال إشارة peer_ready للطرفين
        if (pc && controller) {
            const readyMsg = JSON.stringify({ type: "peer_ready" });
            if (pc.readyState === WebSocket.OPEN) pc.send(readyMsg);
            if (controller.readyState === WebSocket.OPEN) controller.send(readyMsg);
        }

        // توجيه الرسائل: من PC إلى Controller والعكس
        if (data.role === 'pc' && controller && controller.readyState === WebSocket.OPEN) {
            controller.send(message.toString());
        }
        if (data.role === 'controller' && pc && pc.readyState === WebSocket.OPEN) {
            pc.send(message.toString());
        }
    });
    ws.on('close', () => { if (ws === pc) pc = null; if (ws === controller) controller = null; });
});
