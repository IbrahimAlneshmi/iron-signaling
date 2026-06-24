const meshcentral = require('meshcentral');

// Render تفرض منفذاً متغيرًا عبر process.env.PORT
const port = process.env.PORT || 10000;

console.log("Starting MeshCentral on port: " + port);

// تشغيل محرك MeshCentral وتمرير الإعدادات الأساسية متوافقة مع الـ Proxy الخاص بـ Render
const obj = meshcentral({
    settings: {
        port: port,
        aliasport: 443,        // المنفذ الخارجي لـ Render المشفر تلقائياً
        redirport: null,       // إيقاف تحويل الـ HTTP لأن Render يتعامل معه
        agentsport: null,      // دمج حركة مرور الأجهزة مع نفس منفذ السيرفر
        trustedproxy: "127.0.0.1", // الثقة في الـ Load Balancer الخاص بـ Render
        tlsoffload: true       // فك تشفير الـ SSL يتم عند سيرفرات Render وتصل للكود كـ HTTP
    }
});
