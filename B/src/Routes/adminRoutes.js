import express from 'express';
import { updateProductPrice, addOffer, getAllOrders } from '../Controllers/adminController.js';
import { removeOffer, deleteProduct, createProduct } from '../Controllers/adminController.js';
import adminAuth from '../middleware/adminAuth.js';

const router = express.Router();

router.post('/update-price', adminAuth, updateProductPrice); // تحديث سعر المنتج
router.post('/add-offer', adminAuth, addOffer); // إضافة عرض
router.post('/remove-offer', adminAuth, removeOffer); // حذف عرض
router.post('/delete-product', adminAuth, deleteProduct); // حذف منتج
router.post('/create-product', adminAuth, createProduct); // إضافة منتج
router.get('/orders', adminAuth, getAllOrders); // جلب كل الطلبات
export default router;

