import express from 'express';
import { getAllUsers, createUser } from '../controllers/userController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.get('/', auth(), getAllUsers); // تأكد إن الـ auth بترجع function
router.post('/', auth(), createUser);

export default router;