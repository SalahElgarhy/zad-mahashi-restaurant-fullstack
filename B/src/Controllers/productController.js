import Product from '../DB/modules/Product.js';
import { asyncHandler } from '../utils/errorHandler/asyncHandler.js';

export const getAllProducts = asyncHandler(async (req, res, next) => {
  const products = await Product.find();
  res.json({
    success: true,
    data: products,
    message: 'تم جلب المنتجات بنجاح'
  });
});

export const createProduct = asyncHandler(async (req, res, next) => {
  const { name, price, description } = req.body;
  const product = await Product.create({ name, price, description });
  res.status(201).json(product);
});

export const updateProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { name, price, description } = req.body;
  
  const product = await Product.findByIdAndUpdate(
    id, 
    { name, price, description }, 
    { new: true, runValidators: true }
  );
  
  if (!product) {
    return res.status(404).json({ 
      success: false, 
      message: 'المنتج غير موجود' 
    });
  }

  // إرسال تحديث للفرونت عبر Socket.IO
  if (req.app.get('io')) {
    req.app.get('io').emit('menuItemUpdated', {
      item: product,
      message: 'تم تحديث المنتج'
    });
    console.log('🔄 تم إرسال تحديث المنتج للفرونت:', product.name);
  }
  
  res.json({ 
    success: true, 
    data: product,
    message: 'تم تحديث المنتج بنجاح' 
  });
});

export const getProductById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const product = await Product.findById(id);
  
  if (!product) {
    return res.status(404).json({ 
      success: false, 
      message: 'المنتج غير موجود' 
    });
  }
  
  res.json({ 
    success: true, 
    data: product 
  });
});