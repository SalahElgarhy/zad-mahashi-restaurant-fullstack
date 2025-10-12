import mongoose from 'mongoose';
import Order from './Order.js';
import Product from './Product.js';

const orderItemSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true },
  priceAtPurchase: { type: Number, required: true },
}, { timestamps: true });

const OrderItem = mongoose.model('OrderItem', orderItemSchema);

export default OrderItem;
