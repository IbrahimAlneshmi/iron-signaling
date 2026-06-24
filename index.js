// استدعاء مكتبة meshcentral الرئيسية
const meshcentral = require('meshcentral');

// Render تفرض منفذاً متغيرًا عبر process.env.PORT
const port = process.env.PORT || 10000;

console.log("Starting MeshCentral Server via execute on port: " + port);

// MeshCentral يقرأ الإعدادات من الأوامر الممررة (Arguments)
// سنمرر له الإعدادات متوافقة مع البيئة السحابية لـ Render خلف الـ Proxy
meshcentral.execute([
    "--port", port,
    "--aliasport", "443",          // المنفذ الخارجي لـ Render المشفر تلقائياً
    "--redirport", "null",         // إلغاء منفذ تحويل HTTP
    "--agentsport", "null",        // دمج حركة مرور الأجهزة مع نفس منفذ السيرفر
    "--trustedproxy", "127.0.0.1", // الثقة في الـ Load Balancer الخاص بـ Render
    "--tlsoffload"                 // إخبار السيرفر أن فك تشفير الـ SSL يتم خارجياً في سيرفرات Render
]);
