const WebSocket = require('ws');
const PORT = process.env.PORT || 10037;
const wss = new WebSocket.Server({ port: PORT });

let pc = null;
let controller = null;

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        const data = JSON.parse(message);
        
        if (data.role === 'pc') {
            pc = ws;
            console.log("✅ Agent (PC) Registered");
            // إذا كان المتحكم موجوداً، نطلب منه البدء
            if (controller) controller.send(JSON.stringify({ type: "peer_ready" }));
        } 
        else if (data.role === 'controller') {
            controller = ws;
            console.log("✅ Controller Registered");
            // إذا كان الـ PC موجوداً، نطلب من المتحكم البدء
            if (pc) ws.send(JSON.stringify({ type: "peer_ready" }));
        }

        // تمرير الرسائل بدقة
        if (data.role === 'pc' && controller) controller.send(message.toString());
        if (data.role === 'controller' && pc) pc.send(message.toString());
    });

    ws.on('close', () => {
        if (ws === pc) pc = null;
        if (ws === controller) controller = null;
    });
});
console.log(`🚀 Signaling Server Live on port ${PORT}`);
