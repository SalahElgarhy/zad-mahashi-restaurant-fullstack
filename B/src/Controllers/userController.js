import User from '../DB/modules/User.js';
import { asyncHandler } from '../utils/errorHandler/asyncHandler.js';

export const getAllUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find();
  res.json(users);
});

export const createUser = asyncHandler(async (req, res, next) => {
  const user = await User.create(req.body);
  res.status(201).json(user);
});