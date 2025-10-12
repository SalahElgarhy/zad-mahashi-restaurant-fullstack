import mongoose from 'mongoose';
import Product from './Product.js';

const offersSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  discount: { type: Number, required: true }, // نسبة مئوية (0-100)
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  description: { type: String },
}, { timestamps: true });

const Offers = mongoose.model('Offers', offersSchema);
export default Offers;