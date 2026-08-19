import mongoose from 'mongoose';
import config from './config/env.js';
 
const connectDb = async () => {
    try{
        const conn = await mongoose.connect(config.mongoUri);
        console.log(`Connection Successfull ${conn.connection.host}`);
    } catch (error) {
        console.log(`Connection Failed ${error.message}`);
    }
}

export default connectDb;