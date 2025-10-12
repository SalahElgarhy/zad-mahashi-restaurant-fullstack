import express from 'express';
import mongoose from 'mongoose';
import connectDB from './src/DB/connection.js';
import cors from 'cors';
import bootstrap from './src/app.controller.js';
import { Server } from 'socket.io';
import http from 'http';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// إنشاء HTTP Server
const server = http.createServer(app);

// تهيئة Socket.IO
export const io = new Server(server, {
  cors: {
    origin: ['http://localhost:8080', 'http://127.0.0.1:8080', 'http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
});

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

    server.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
  }
})();