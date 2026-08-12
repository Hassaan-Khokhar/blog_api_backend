import express from 'express';
import cookieParser from 'cookie-parser';
import connectDb from './db.js';
import route from './routes/blogRoutes.js';
import authRoute from './routes/authRoutes.js';
import dotenv from 'dotenv';


dotenv.config();
connectDb();

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use('/api/blogs', route);
app.use('/api/users', authRoute);

const PORT = process.env.PORT || 5000;

app.listen(PORT, ()=>{
    console.log(`Server Up at PORT ${PORT}`);
})