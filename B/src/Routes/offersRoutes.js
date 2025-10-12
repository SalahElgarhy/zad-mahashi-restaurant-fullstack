import express from 'express';
import { getAllOffers, createOffer } from '../Controllers/offersController.js';
import auth from '../../middleware/auth.js';

const router = express.Router();

router.get('/', auth(), getAllOffers);
router.post('/', auth(), createOffer);

export default router;