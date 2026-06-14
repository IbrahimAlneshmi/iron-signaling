const WebSocket = require('ws');
const port = process.env.PORT || 10037;
const wss = new WebSocket.Server({ port });

let pcSocket = null;
let controllerSocket = null;

// مخزن مؤقت لحفظ الـ Offer في حال أرسله الـ Viewer ولم يكن الـ Agent متصلاً بعد
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

        // 1. تسجيل الأدوار وحفظ الاتصال
        if (data.role === 'pc') {
            pcSocket = ws;
            console.log("🤖 Agent (PC) Registered and Ready.");

            // 🔥 ميزة ذكية: إذا كان هناك Offer أو Candidates معلقة بانتظار الـ Agent، نرسلها له فوراً بمجرد دخوله
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

        // 2. منطق توجيه الرسائل الذكي
        // إذا كانت الرسالة قادمة من الـ Viewer (Controller)
        if (data.role === 'controller') {
            if (pcSocket && pcSocket.readyState === WebSocket.OPEN) {
                pcSocket.send(message.toString());
            } else {
                // إذا لم يكن الـ Agent متصلاً، نخزن الـ offer والـ candidates مؤقتاً في الذاكرة
                if (data.type === 'offer') {
                    pendingOffer = data;
                    console.log("⏳ Agent is offline. Offer cached in memory.");
                } else if (data.type === 'candidate') {
                    pendingCandidates.push(data);
                }
            }
        }
        // إذا كانت الرسالة قادمة من الـ Agent (PC) وتتضمن الـ Answer أو Candidates
        else if (data.role === 'pc') {
            if (controllerSocket && controllerSocket.readyState === WebSocket.OPEN) {
                controllerSocket.send(message.toString());
            }
        }
    });

    // 3. معالجة انقطاع الاتصال وتنظيف الذاكرة
    ws.on('close', () => {
        if (ws === pcSocket) { 
            pcSocket = null; 
            console.log("❌ Agent disconnected");
            // إعلام الـ Viewer إن كان متصلاً ليقوم بتهيئة نفسه للاستماع مجدداً
            if (controllerSocket && controllerSocket.readyState === WebSocket.OPEN) {
                controllerSocket.send(JSON.stringify({ type: "peer_disconnected" }));
            }
        }
        if (ws === controllerSocket) { 
            controllerSocket = null; 
            pendingOffer = null; // تصفير الكاش عند خروج المتحكم
            pendingCandidates = [];
            console.log("❌ Viewer disconnected");
            
            // إعلام الـ Agent ليعيد تصفير الـ P2P ويبدأ الانتظار من جديد
            if (pcSocket && pcSocket.readyState === WebSocket.OPEN) {
                pcSocket.send(JSON.stringify({ type: "peer_disconnected" }));
            }
        }
    });
});

console.log(`🚀 Advanced Signaling server running on port ${port}`);
