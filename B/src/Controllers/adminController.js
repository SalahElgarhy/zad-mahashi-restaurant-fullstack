import Order from '../DB/modules/Order.js';
import { asyncHandler } from '../utils/errorHandler/asyncHandler.js';
import Offers from '../DB/modules/Offers.js';
import Product from '../DB/modules/Product.js';


export const updateProductPrice = asyncHandler(async (req, res, next) => {
  const { productId, price } = req.body;
  const product = await Product.findByIdAndUpdate(productId, { price }, { new: true });
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product);
});

export const addOffer = asyncHandler(async (req, res, next) => {
  const { productId, discount, expiryDate } = req.body;
  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  product.offer = { discount, expiryDate };
  await product.save();
  res.status(201).json(product);
});

export const removeOffer = asyncHandler(async (req, res, next) => {
  const { productId } = req.body;
  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  product.offer = undefined;
  await product.save();
  res.json(product);
});

export const deleteProduct = asyncHandler(async (req, res, next) => {
  const { productId } = req.body;
  const product = await Product.findByIdAndDelete(productId);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json({ message: 'Product deleted successfully' });
});

export const createProduct = asyncHandler(async (req, res, next) => {
  const { name, price, description } = req.body;
  const product = await Product.create({ name, price, description });
  res.status(201).json(product);
});

export const getAllOrders = asyncHandler(async (req, res, next) => {
  const orders = await Order.find().populate('items.productId', 'name price');
  res.json(orders);
});