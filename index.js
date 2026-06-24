const path = require('path');
const fs = require('fs');

// Render تفرض منفذاً متغيرًا عبر process.env.PORT
const port = process.env.PORT || 10000;

console.log("Initializing MeshCentral Config for Render on port: " + port);

// التأكد من وجود مجلد البيانات محلياً حتى لا ينهار السيرفر
const dataPath = path.join(__dirname, 'meshcentral-data');
if (!fs.existsSync(dataPath)){
    fs.mkdirSync(dataPath, { recursive: true });
}

// استدعاء ملف السيرفر الداخلي مباشرة من الحزمة وتمرير الإعدادات كـ Object
// هذا يتخطى سطر الأوامر تماماً ويجبره على الاستمرار في العمل خلف Proxy
try {
    const meshcentral = require('meshcentral/meshcentral.js');
    
    // تشغيل السيرفر عن طريق حقن الإعدادات في الكائن الداخلي لـ MeshCentral
    const args = {
        port: port,
        aliasport: 443,
        redirport: null,
        agentsport: null,
        trustedproxy: "127.0.0.1",
        tlsoffload: true,
        datapath: dataPath // إجبار السيرفر على حفظ البيانات في المجلد الحالي للمشروع
    };

    console.log("Launching MeshCentral core...");
    
    // إنشاء نسخة وتشغيلها بأسلوب النواة (Core-level launch)
    const obj = new meshcentral.MeshCentralServer();
    obj.start(args);

} catch (error) {
    console.error("Critical error during MeshCentral launch:", error);
    process.exit(1);
}
