import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const connectDB = async ()=> {

    await mongoose.connect(process.env.MONGODB_URI) 
    .then (()=> {
        
        console.log('Database connected successfully');
        
    })
    .catch((error)=> {
        console.log("ENV MONGODB_URI:", process.env.MONGODB_URI);

        console.error('Database connection error:', error);
    })
}


export default connectDB;