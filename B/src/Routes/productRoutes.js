import express from 'express';
import { getAllProducts, createProduct, updateProduct, getProductById } from '../Controllers/productController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.post('/', createProduct);
router.put('/:id', updateProduct);

export default router;