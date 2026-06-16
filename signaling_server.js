const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // السماح بالاتصال من أي مكان
        methods: ["GET", "POST"]
    }
});

// مخزن الأجهزة المكتشفة
let devices = {};

app.get('/', (req, res) => {
    res.send('ITG Signaling Server is Running...');
});

io.on('connection', (socket) => {
    console.log(`New connection: ${socket.id}`);

    // حدث تسجيل الجهاز
    socket.on('register', (data) => {
        const deviceId = data.device_id;
        const deviceInfo = data.device_info || {};

        // تحديد الـ IP العام للجهاز
        // Render يستخدم بروكسي، لذا نأخذ العنوان من x-forwarded-for
        let publicIp = socket.handshake.headers['x-forwarded-for'] || socket.conn.remoteAddress;
        
        // إذا كان هناك أكثر من IP (بسبب البروكسي)، نأخذ الأول
        if (publicIp && publicIp.includes(',')) {
            publicIp = publicIp.split(',')[0].trim();
        }

        deviceInfo.ip = publicIp;
        deviceInfo.last_seen = Date.now();
        deviceInfo.socket_id = socket.id;

        devices[deviceId] = deviceInfo;

        console.log(`Device Registered: ${deviceInfo.name} [${deviceId}] at IP: ${publicIp}`);
        socket.emit('register_response', { status: 'ok', public_ip: publicIp });
    });

    // حدث البحث عن الأجهزة
    socket.on('discover', () => {
        const currentTime = Date.now();
        
        // تنظيف الأجهزة التي لم تتصل منذ أكثر من 60 ثانية
        Object.keys(devices).forEach(id => {
            if (currentTime - devices[id].last_seen > 60000) {
                delete devices[id];
            }
        });

        socket.emit('discover_response', { devices: Object.values(devices) });
    });

    // عند قطع الاتصال
    socket.on('disconnect', () => {
        for (let id in devices) {
            if (devices[id].socket_id === socket.id) {
                console.log(`Device disconnected: ${id}`);
                delete devices[id];
                break;
            }
        }
    });
});

// تشغيل السيرفر على المنفذ الذي تحدده Render أو 10000 افتراضياً
const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
