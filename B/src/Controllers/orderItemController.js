import OrderItem from '../DB/modules/OrderItem.js';

import { asyncHandler } from '../utils/errorHandler/asyncHandler.js';

export const getAllOrderItems = asyncHandler(async (req, res, next) => {
  const orderItems = await OrderItem.find().populate(['orderId', 'productId']);
  res.json(orderItems);
});

export const createOrderItem = asyncHandler(async (req, res, next) => {
  const orderItem = await OrderItem.create(req.body);
  res.status(201).json(orderItem);
});