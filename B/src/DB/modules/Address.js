import mongoose from 'mongoose';
import User from './User.js';

const addressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  street: { type: String, required: true },
  city: { type: String, required: true },
  country: { type: String, default: 'Egypt' },
}, { timestamps: true });

const Address = mongoose.model('Address', addressSchema);

export default Address;