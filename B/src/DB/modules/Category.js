import mongoose from "mongoose";
import { model } from "mongoose";
import user from "./User.js";

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });




const Category = mongoose.model('Category', categorySchema);
export default Category;