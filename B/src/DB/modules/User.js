import { Admin } from 'mongodb';
import mongoose from 'mongoose';



export const userRoles = {
    Admin: 'admin',
    User: 'user'
}


const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  role: { type: String, default: 'user' }, // 'user' or 'admin'
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

export default User;
