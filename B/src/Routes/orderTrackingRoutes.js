import express from 'express';
import { getAllOrderTrackings, createOrderTracking } from '../Controllers/OrderTracking.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.get('/', auth(), getAllOrderTrackings);
router.post('/', auth(), createOrderTracking);

export default router;