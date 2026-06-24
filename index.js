const path = require('path');
const fs = require('fs');

// Render تفرض منفذاً متغيرًا عبر process.env.PORT
const port = process.env.PORT || 10000;

console.log("Initializing MeshCentral Core System for Render on port: " + port);

// التأكد من وجود مجلد البيانات محلياً لمنع الأخطاء
const dataPath = path.join(__dirname, 'meshcentral-data');
if (!fs.existsSync(dataPath)){
    fs.mkdirSync(dataPath, { recursive: true });
}

try {
    // استدعاء ملف التشغيل الرئيسي الحقيقي مباشرة من المجلد
    const meshcentralmodule = require('meshcentral/meshcentral.js');
    
    // الإعدادات المطلوبة للتشغيل متوافقة مع الـ Proxy الخاص بـ Render
    const config = {
        settings: {
            port: port,
            aliasport: 443,
            redirport: null,
            agentsport: null,
            trustedproxy: "127.0.0.1",
            tlsoffload: true,
            datapath: dataPath
        }
    };

    console.log("Launching via CreateMeshCentralServer...");
    
    // الطريقة الرسمية المذكورة في كود السيرفر لإنشائه برمجياً
    const server = meshcentralmodule.CreateMeshCentralServer(config);
    
    // بدء تشغيل السيرفر
    server.start();

} catch (error) {
    console.error("Critical error during MeshCentral launch:", error);
    process.exit(1);
}
