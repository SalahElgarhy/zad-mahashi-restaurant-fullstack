import express from 'express';
import mongoose from 'mongoose';
import connectDB from './src/DB/connection.js';
import cors from 'cors';
import bootstrap from './src/app.controller.js';
import { Server } from 'socket.io';
import http from 'http';
import dotenv from 'dotenv';
import configManager, { config } from './src/config/configManager.js';

dotenv.config();

const app = express();
const PORT = config.port;
const HOST = config.host;

// طباعة Configuration
configManager.print();

// إنشاء HTTP Server
const server = http.createServer(app);

// تهيئة Socket.IO مع CORS من Config Manager
export const io = new Server(server, {
  cors: {
    origin: config.allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
});

console.log('🔌 Socket.IO CORS configured for:', config.allowedOrigins);

// إعدادات Socket.IO
io.on('connection', (socket) => {
  console.log('🔔 A user connected:', socket.id);
  
  // الانضمام لغرفة الأدمن
  socket.on('join-admin', () => {
    socket.join('admin');
    console.log('👤 Admin joined room:', socket.id);
  });

  // استماع للطلبات الجديدة
  socket.on('newOrder', (orderData) => {
    console.log('� New order received via socket:', orderData);
    // إرسال للأدمن
    io.to('admin').emit('orderReceived', orderData);
  });

  // استماع لتحديثات الطلبات
  socket.on('orderUpdated', (updateData) => {
    console.log('🔄 Order update received:', updateData);
    // إرسال للأدمن
    io.to('admin').emit('orderStatusChanged', updateData);
  });

  // استماع لتحديثات القائمة
  socket.on('menuUpdated', (updateData) => {
    console.log('🍽️ Menu update received:', updateData);
    // إرسال لجميع المتصلين (الصفحة الرئيسية والأدمن)
    socket.broadcast.emit('menuUpdated', updateData);
  });

  // استماع لتحديثات العروض
  socket.on('offersUpdated', (updateData) => {
    console.log('🎁 Offers update received:', updateData);
    // إرسال لجميع المتصلين
    socket.broadcast.emit('offersUpdated', updateData);
  });

  // استماع لتحديثات المشروبات
  socket.on('beveragesUpdated', (updateData) => {
    console.log('🥤 Beverages update received:', updateData);
    // إرسال لجميع المتصلين
    socket.broadcast.emit('beveragesUpdated', updateData);
  });

  socket.on('disconnect', () => {
    console.log('�👋 User disconnected:', socket.id);
  });
});

// تنفيذ الـ Bootstrap بعد الاتصال بـ DB
(async () => {
  try {
    await connectDB();
    await bootstrap(app, express, io);

    // إضافة Static Files serving للـ Frontend
    const path = await import('path');
    const { fileURLToPath } = await import('url');
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    
    // خدمة ملفات Frontend
    const frontendPath = path.join(__dirname, '..', 'forentend');
    app.use(express.static(frontendPath));
    
    // Route للصفحة الرئيسية
    app.get('/', (req, res) => {
      res.sendFile(path.join(frontendPath, 'index.html'));
    });

    server.listen(PORT, HOST, () => {
      console.log(`\n🚀 ========== SERVER STARTED ==========`);
      console.log(`📍 Environment: ${config.env}`);
      console.log(`🌐 Server: http://${HOST}:${PORT}`);
      console.log(`📁 Frontend: ${frontendPath}`);
      console.log(`💾 Database: Connected ✅`);
      console.log(`🔌 Socket.IO: Enabled ✅`);
      console.log(`🔐 CORS: ${config.allowedOrigins.length} origins`);
      console.log(`=======================================\n`);
    });
  } catch (error) {
    console.error('\n❌ ========== SERVER FAILED TO START ==========');
    console.error('❌ Error:', error.message);
    console.error('❌ Stack:', error.stack);
    console.error('===============================================\n');
    process.exit(1);
  }
})();

// Graceful Shutdown للـ Production
const gracefulShutdown = async (signal) => {
  console.log(`\n⚠️  ${signal} received. Starting graceful shutdown...`);
  
  try {
    // إغلاق HTTP Server
    server.close(() => {
      console.log('✅ HTTP server closed');
    });
    
    // إغلاق Socket.IO connections
    io.close(() => {
      console.log('✅ Socket.IO connections closed');
    });
    
    // إغلاق MongoDB connection
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    
    console.log('✅ Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
};

// معالجة إشارات الإغلاق
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// معالجة الأخطاء غير المتوقعة
process.on('uncaughtException', (error) => {
  console.error('\n❌ ========== UNCAUGHT EXCEPTION ==========');
  console.error('❌ Error:', error.message);
  console.error('❌ Stack:', error.stack);
  console.error('==========================================\n');
  gracefulShutdown('UNCAUGHT EXCEPTION');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('\n❌ ========== UNHANDLED REJECTION ==========');
  console.error('❌ Reason:', reason);
  console.error('❌ Promise:', promise);
  console.error('===========================================\n');
  gracefulShutdown('UNHANDLED REJECTION');
});