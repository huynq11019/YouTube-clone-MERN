// redisClient.js
const Redis = require('ioredis');

// Khởi tạo client Redis với cấu hình mặc định
const client = new Redis({
    host: 'redis-16632.c340.ap-northeast-2-1.ec2.redns.redis-cloud.com', // Địa chỉ của Redis server
    port: 16632,        // Cổng mặc định của Redis
    password: 's9IvzslxV5QZkST9SYTlfgchEwNCe35b', // Mật khẩu để kết nối đến Redis server
});

// Xử lý các sự kiện kết nối
client.on('connect', () => {
    console.log('Connected to Redis');
});

client.on('error', (err) => {
    console.error('Redis connection error:', err);
});

module.exports = client;
