import OrderTracking from '../Routes/orderTrackingRoutes.js';
import { asyncHandler } from '../utils/errorHandler/asyncHandler.js';

// إنشاء Order Tracking
export const createOrderTracking = asyncHandler(async (req, res, next) => {
  const orderTracking = await OrderTracking.create(req.body);
  res.status(201).json(orderTracking);
});

// جلب كل Order Trackings
export const getAllOrderTrackings = asyncHandler(async (req, res, next) => {
  const orderTrackings = await OrderTracking.find().populate('orderId'); // جلب بيانات الطلب المرتبط
  res.json(orderTrackings);
});

// تحديث Order Tracking
export const updateOrderTracking = asyncHandler(async (req, res, next) => {
  const orderTracking = await OrderTracking.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!orderTracking) return res.status(404).json({ message: 'Order tracking not found' });
  res.json(orderTracking);
});

// حذف Order Tracking
export const deleteOrderTracking = asyncHandler(async (req, res, next) => {
  const orderTracking = await OrderTracking.findByIdAndDelete(req.params.id);
  if (!orderTracking) return res.status(404).json({ message: 'Order tracking not found' });
  res.json({ message: 'Order tracking deleted successfully', id: req.params.id });
});