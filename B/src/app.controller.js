import express from 'express';
import mongoose from 'mongoose'; 
import connectDB from './DB/connection.js';
import cors from 'cors';
import globalErrorHandler from './utils/errorHandler/golobalErrorHandler.js';
import * as orderController from './Controllers/orderController.js';
import dotenv from 'dotenv';
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
  
  app.use(cors({
    origin: ['http://localhost:8080', 'http://127.0.0.1:8080', 'http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  }));
  app.use(express.json());
  
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