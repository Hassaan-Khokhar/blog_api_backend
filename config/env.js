import dotenv from 'dotenv';
dotenv.config();

const config = {
    port: process.env.PORT || 5000,
    mongoUri: process.env.MONGO_URI,
    jwtSecret: process.env.JWT_SECRET,
    refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
    stripeSecretKey: process.env.STRIPE_SECRET_KEY,
    nodeEnv: process.env.NODE_ENV || 'development'
};

export default config;