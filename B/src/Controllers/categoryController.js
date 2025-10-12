import Category from '../DB/modules/Category.js';
import { asyncHandler } from '../utils/errorHandler/asyncHandler.js';

export const getAllCategories = asyncHandler(async (req, res, next) => {
  const categories = await Category.find();
  res.json(categories);
});

export const createCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.create(req.body);
  res.status(201).json(category);
});