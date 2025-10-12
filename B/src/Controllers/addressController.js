import Address from '../DB/modules/Address.js';
import { asyncHandler } from '../utils/errorHandler/asyncHandler.js';

export const getAllAddresses = asyncHandler(async (req, res, next) => {
  const addresses = await Address.find().populate('userId');
  res.json(addresses);
});

export const createAddress = asyncHandler(async (req, res, next) => {
  const address = await Address.create(req.body);
  res.status(201).json(address);
});