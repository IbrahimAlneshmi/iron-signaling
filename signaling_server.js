const WebSocket = require('ws');
const port = process.env.PORT || 10037;
const wss = new WebSocket.Server({ port });

let pc = null;
let controller = null;

wss.on('connection', (ws) => {
    console.log("New connection established");

    ws.on('message', (message) => {
        let data;
        try {
            data = JSON.parse(message);
        } catch (e) { return; }

        // تعريف الأدوار
        if (data.role === 'pc') {
            pc = ws;
            console.log("Agent (PC) is registered");
        } else if (data.role === 'controller') {
            controller = ws;
            console.log("Viewer (Controller) is registered");
        }

        // توجيه الرسائل بين الطرفين
        if (data.role === 'pc' && controller) {
            controller.send(message.toString());
        } else if (data.role === 'controller' && pc) {
            pc.send(message.toString());
        }
    });

    ws.on('close', () => {
        if (ws === pc) { pc = null; console.log("Agent disconnected"); }
        if (ws === controller) { controller = null; console.log("Viewer disconnected"); }
    });
});

console.log(`Signaling server running on port ${port}`);
