import Category from "./Category.js";
import mongoose from "mongoose";
import { model } from "mongoose";
import user from "./User.js";


const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String },
  offer: {
    discount: Number,
    expiryDate: Date,
  },
}, { timestamps: true });

export default mongoose.model('Product', productSchema);