import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import connectDb from './db.js';
import route from './routes/blogRoutes.js';
import authRoute from './routes/authRoutes.js';
import errorHandler from './middlewares/errorHandler.js';
import config from './config/env.js';

connectDb();

const app = express();
app.use(helmet());


const limiter = rateLimit({
    windowMs: 15*60*1000,
    max: 100,
    message: {
        success: false,
        message: "Too many requests from this IP, Please try again later."
    }
});

app.use(limiter);

app.use(express.json());
app.use(cookieParser());
app.use('/api/blogs', route);
app.use('/api/users', authRoute);

app.use((req, res, next) => {
    const error = new Error(`Route not found: ${req.originalUrl}`);
    error.statusCode = 404;
    next(error);
});

app.use(errorHandler);

const PORT = config.port;

app.listen(PORT, () => {
    console.log(`Server Up at PORT ${PORT}`);
})