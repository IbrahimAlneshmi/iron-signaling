const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

// رفع حد حجم البيانات المرسلة (مهم جداً لنقل صور الشاشة)
const io = new Server(server, {
    maxHttpBufferSize: 1e7, // زيادة الحجم إلى 10 ميجابايت لاستيعاب الصور الكبيرة
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

let devices = {};

app.get('/', (req, res) => {
    res.send('ITG Relay & Signaling Server is Running...');
});

io.on('connection', (socket) => {
    console.log(`New connection: ${socket.id}`);

    // --- 1. جزء التسجيل والتعارف (بقي كما هو مع تحسين) ---
    socket.on('register', (data) => {
        const deviceId = data.device_id;
        const deviceInfo = data.device_info || {};

        let publicIp = socket.handshake.headers['x-forwarded-for'] || socket.conn.remoteAddress;
        if (publicIp && publicIp.includes(',')) publicIp = publicIp.split(',')[0].trim();

        deviceInfo.ip = publicIp;
        deviceInfo.last_seen = Date.now();
        deviceInfo.socket_id = socket.id; // نحتفظ بمعرف السوكيت للتوجه إليه لاحقاً

        devices[deviceId] = deviceInfo;

        console.log(`Registered: ${deviceInfo.name} [${deviceId}]`);
        socket.emit('register_response', { status: 'ok', public_ip: publicIp });
    });

    socket.on('discover', () => {
        const currentTime = Date.now();
        Object.keys(devices).forEach(id => {
            if (currentTime - devices[id].last_seen > 60000) delete devices[id];
        });
        socket.emit('discover_response', { devices: Object.values(devices) });
    });

    // --- 2. جزء الترحيل (The Relay System) - سر عمل HelpWire ---
    
    // عندما يريد المتحكم (Controller) إرسال أمر للجهاز (Controlled)
    socket.on('send_command', (data) => {
        // data.target_sid هو معرف السوكيت الخاص بالجهاز المستهدف
        // data.payload هو الأمر (ماوس، كيبورد، أو طلب شاشة)
        if (data.target_sid) {
            io.to(data.target_sid).emit('receive_command', {
                from_sid: socket.id,
                payload: data.payload
            });
        }
    });

    // عندما يريد الجهاز (Controlled) إرسال صورة الشاشة للمتحكم
    socket.on('send_data', (data) => {
        // data.target_sid هو معرف السوكيت الخاص بالمتحكم الذي طلب الشاشة
        if (data.target_sid) {
            io.to(data.target_sid).emit('receive_data', {
                from_sid: socket.id,
                payload: data.payload
            });
        }
    });

    socket.on('disconnect', () => {
        for (let id in devices) {
            if (devices[id].socket_id === socket.id) {
                console.log(`Disconnected: ${id}`);
                delete devices[id];
                break;
            }
        }
    });
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
