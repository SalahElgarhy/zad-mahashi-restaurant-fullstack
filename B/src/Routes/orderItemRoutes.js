import express from 'express';
import { getAllOrderItems, createOrderItem } from '../Controllers/orderItemController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.get('/', auth(), getAllOrderItems);
router.post('/', auth(), createOrderItem);

export default router;