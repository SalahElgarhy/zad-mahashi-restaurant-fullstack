import express from 'express';
import { getAllCategories, createCategory } from '../Controllers/categoryController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.get('/', (req, res, next) => {
  const authResult = auth(req, res, next);
  if (authResult && authResult.error) {
    return res.status(500).json({ message: authResult.error });
  }
  getAllCategories(req, res, next);
});

router.post('/', (req, res, next) => {
  const authResult = auth(req, res, next);
  if (authResult && authResult.error) {
    return res.status(500).json({ message: authResult.error });
  }
  createCategory(req, res, next);
});

export default router;