import express from 'express';
import { getAllAddresses, createAddress } from '../Controllers/addressController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.get('/', auth(), getAllAddresses); // تأكد إن الـ auth بترجع function
router.post('/', auth(), createAddress);

export default router;