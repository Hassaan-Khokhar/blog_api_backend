import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
 
const connectDb = async () => {
    try{
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`Connection Successfull ${conn.connection.host}`);
    } catch (error) {
        console.log(`Connection Failed ${error.message}`);
    }
}

export default connectDb;