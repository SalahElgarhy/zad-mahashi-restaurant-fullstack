import express from 'express';
import mongoose from 'mongoose'; 
import connectDB from './DB/connection.js';
import cors from 'cors';
import globalErrorHandler from './utils/errorHandler/golobalErrorHandler.js';
import * as orderController from './Controllers/orderController.js';
import dotenv from 'dotenv';
import { config } from './config/configManager.js';
dotenv.config();

// _________________________________________

import userRoutes from './Routes/userRoutes.js';
import addressRoutes from './Routes/addressRoutes.js';
import categoryRoutes from './Routes/categoryRoutes.js';
import productRoutes from './Routes/productRoutes.js';
import orderRoutes from './Routes/orderRoutes.js';
import orderItemRoutes from './Routes/orderItemRoutes.js';
import orderTrackingRoutes from './Routes/orderTrackingRoutes.js';
import adminRoutes from './Routes/adminRoutes.js';

//___________________________________________


const bootstrap = async (app, express, io) => {
  await connectDB(); // لو كان موجود هنا، خليه يتم من index.js
  
  // حفظ Socket.IO في app ليكون متاح في Controllers
  app.set('io', io);
  
  // إعداد CORS للـ Production - استخدام FRONTEND_URL
  const allowedOrigins = process.env.ALLOWED_ORIGINS ? 
    process.env.ALLOWED_ORIGINS.split(',') : 
    [process.env.FRONTEND_URL || 'http://localhost:8080'];
  
  app.use(cors({
    origin: (origin, callback) => {
      // السماح للطلبات بدون origin (مثل Postman أو mobile apps)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`⚠️ CORS blocked request from: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  }));
  app.use(express.json());

  // Middleware لتسجيل جميع الطلبات الواردة
  app.use((req, res, next) => {
    console.log('\n🔹 ========== طلب وارد جديد ==========');
    console.log(`📍 الطريقة: ${req.method}`);
    console.log(`📍 المسار: ${req.path}`);
    console.log(`📍 من: ${req.ip || req.connection.remoteAddress}`);
    console.log(`📍 الوقت: ${new Date().toLocaleString('ar-EG')}`);
    if (req.body && Object.keys(req.body).length > 0) {
      console.log('📦 البيانات المرسلة:', JSON.stringify(req.body, null, 2));
    }
    console.log('🔹 ====================================\n');
    next();
  });

  // Middleware لتسجيل الأخطاء في الطلبات
  app.use((err, req, res, next) => {
    console.error('\n❌ ========== خطأ في معالجة الطلب ==========');
    console.error(`📍 الطريقة: ${req.method}`);
    console.error(`📍 المسار: ${req.path}`);
    console.error(`📍 الخطأ: ${err.message}`);
    console.error(`📍 Stack Trace:`, err.stack);
    console.error('❌ ==========================================\n');
    next(err);
  });

  
  // Health Check endpoint
  app.get('/api/health', (req, res) => {
    res.status(200).json({
      status: 'OK',
      message: 'Server is running',
      timestamp: new Date().toISOString(),
      environment: config.env,
      port: config.port,
      host: config.host,
      cors: config.allowedOrigins
    });
  });
  
  app.use('/api/users', userRoutes);
  app.use('/api/addresses', addressRoutes);
  app.use('/api/categories', categoryRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/menu', productRoutes); // إضافة route للمنيو
  app.use('/api/orders', orderRoutes);
  app.use('/api/order-items', orderItemRoutes);
  app.use('/api/order-tracking', orderTrackingRoutes);
  app.use('/api/admin', adminRoutes);
  app.use(globalErrorHandler);
};

export default bootstrap