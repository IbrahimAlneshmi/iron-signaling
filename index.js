const path = require('path');

// جلب مسار ملف التشغيل الرئيسي لـ MeshCentral من داخل الحزم المثبتة
const meshCentralPath = path.join(__dirname, 'node_modules', 'meshcentral', 'meshcentral.js');

// Render تفرض منفذاً متغيرًا عبر process.env.PORT
const port = process.env.PORT || 10000;

console.log("Starting MeshCentral Server directly via file path on port: " + port);

// تجهيز الأوامر (Arguments) لتمريرها للسيرفر كأنه يعمل من الـ Terminal
process.argv = [
    process.argv[0], // مسار تشغيل الـ node
    meshCentralPath, // مسار ملف meshcentral.js
    "--port", port,
    "--aliasport", "443",          // المنفذ الخارجي لـ Render المشفر تلقائياً
    "--redirport", "null",         // إلغاء منفذ تحويل HTTP
    "--agentsport", "null",        // دمج حركة مرور الأجهزة مع نفس منفذ السيرفر
    "--trustedproxy", "127.0.0.1", // الثقة في الـ Load Balancer الخاص بـ Render
    "--tlsoffload"                 // إخبار السيرفر أن فك تشفير الـ SSL يتم خارجياً
];

// استدعاء وتشغيل الملف مباشرة، ليقوم بقراءة الـ process.argv التي جهزناها في الأعلى
require(meshCentralPath);
