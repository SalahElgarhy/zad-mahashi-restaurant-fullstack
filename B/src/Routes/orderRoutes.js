import express from 'express';
import { createOrder, getAllOrders, updateOrderStatus, deleteOrder, getOrderById } from '../Controllers/orderController.js';
const router = express.Router();

// إضافة طلب جديد بدون توكن
router.post('/', createOrder);

// جلب كل الطلبات (للأدمن أو العميل)
router.get('/', getAllOrders);

// جلب طلب معين باستخدام orderId
router.get('/:orderId', getOrderById);

// تحديث حالة الطلب
router.put('/:orderId', updateOrderStatus);

// حذف/إلغاء الطلب
router.delete('/:orderId', deleteOrder);



export default router;