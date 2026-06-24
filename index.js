const path = require('path');
const fs = require('fs');

// Render تفرض منفذاً متغيرًا عبر process.env.PORT
const port = process.env.PORT || 10000;

console.log("Initializing MeshCentral Config for Render on port: " + port);

// التأكد من وجود مجلد البيانات محلياً لمنع الأخطاء
const dataPath = path.join(__dirname, 'meshcentral-data');
if (!fs.existsSync(dataPath)){
    fs.mkdirSync(dataPath, { recursive: true });
}

try {
    // استدعاء مكتبة meshcentral الحقيقية
    const meshcentral = require('meshcentral');
    
    // الإعدادات المطلوبة للتشغيل
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

    console.log("Launching MeshCentral core via direct function call...");
    
    // تشغيل السيرفر مباشرة كدالة وتمرير الإعدادات بداخلها (بدون كلمة new)
    const obj = meshcentral(config);

} catch (error) {
    console.error("Critical error during MeshCentral launch:", error);
    process.exit(1);
}
