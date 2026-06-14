const WebSocket = require('ws');
const port = process.env.PORT || 10037;
const wss = new WebSocket.Server({ port });

let pcSocket = null;
let controllerSocket = null;

// مخزن مؤقت لحفظ الـ Offer والـ Candidates لضمان عدم ضياعها
let pendingOffer = null;
let pendingCandidates = [];

wss.on('connection', (ws) => {
    console.log(" New connection established");

    ws.on('message', (message) => {
        let data;
        try {
            data = JSON.parse(message);
        } catch (e) { 
            return; 
        }

        // تسجيل الأدوار وحفظ الاتصال
        if (data.role === 'pc') {
            pcSocket = ws;
            console.log("🤖 Agent (PC) Registered and Ready.");

            // إذا كان هناك Offer معلق بانتظار الـ Agent، نرسله له فوراً
            if (pendingOffer) {
                console.log("⚡ Delivering cached Offer to the newly connected Agent...");
                pcSocket.send(JSON.stringify(pendingOffer));
                
                // إرسال كل الـ Candidates المخزنة له
                pendingCandidates.forEach(cand => pcSocket.send(JSON.stringify(cand)));
                pendingCandidates = [];
            }
        } 
        else if (data.role === 'controller') {
            controllerSocket = ws;
            console.log("📺 Viewer (Controller) Registered and Ready.");
        }

        // منطق توجيه الرسائل الذكي
        if (data.role === 'controller') {
            if (pcSocket && pcSocket.readyState === WebSocket.OPEN) {
                pcSocket.send(message.toString());
            } else {
                // إذا لم يكن الـ Agent متصلاً بعد، نخزن البيانات مؤقتاً
                if (data.type === 'offer') {
                    pendingOffer = data;
                    console.log("⏳ Agent is offline. Offer cached in memory.");
                } else if (data.type === 'candidate') {
                    pendingCandidates.push(data);
                }
            }
        }
        else if (data.role === 'pc') {
            if (controllerSocket && controllerSocket.readyState === WebSocket.OPEN) {
                controllerSocket.send(message.toString());
            }
        }
    });

    ws.on('close', () => {
        if (ws === pcSocket) { 
            pcSocket = null; 
            console.log("❌ Agent disconnected");
            if (controllerSocket && controllerSocket.readyState === WebSocket.OPEN) {
                controllerSocket.send(JSON.stringify({ type: "peer_disconnected" }));
            }
        }
        if (ws === controllerSocket) { 
            controllerSocket = null; 
            pendingOffer = null; 
            pendingCandidates = [];
            console.log("❌ Viewer disconnected");
            
            if (pcSocket && pcSocket.readyState === WebSocket.OPEN) {
                pcSocket.send(JSON.stringify({ type: "peer_disconnected" }));
            }
        }
    });
});

console.log(`🚀 Advanced Signaling server running on port ${port}`);
