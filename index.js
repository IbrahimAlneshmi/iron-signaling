const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Render تفرض منفذاً متغيرًا عبر process.env.PORT
const port = process.env.PORT || 10000;

console.log("Preparing background process for MeshCentral on port: " + port);

// تحديد مسار الملف التنفيذي الحقيقي لـ MeshCentral داخل الـ node_modules
const meshCentralPath = path.join(__dirname, 'node_modules', 'meshcentral', 'meshcentral.js');

// التأكد من وجود مجلد حفظ البيانات حتى لا ينهار السيرفر
const dataPath = path.join(__dirname, 'meshcentral-data');
if (!fs.existsSync(dataPath)){
    fs.mkdirSync(dataPath, { recursive: true });
}

// تجهيز الأوامر الممررة للملف بناءً على قائمة الـ validArguments الموجودة في الكود الخاص بك
const args = [
    meshCentralPath,
    "--port", port,
    "--aliasport", "443",
    "--redirport", "null",
    "--agentsport", "null",
    "--datapath", dataPath,
    "--trustedproxy", "127.0.0.1",
    "--tlsoffload"
];

console.log("Launching MeshCentral process via Node...");

// إطلاق عملية Node جديدة لتشغيل السيرفر بشكل مستقل تماماً عن الـ require المزعج
const meshProcess = spawn('node', args, {
    env: process.env,
    stdio: 'inherit' // جعل السيرفر يطبع الـ Logs مباشرة في لوحة تحكم Render
});

meshProcess.on('error', (err) => {
    console.error('Failed to start MeshCentral process:', err);
});

meshProcess.on('exit', (code) => {
    console.log(`MeshCentral process exited with code ${code}`);
});
