import config from '../config/env.js';

const errorHandler = async (err, req, res, next) => {

    let error = { ...err };
    error.message = err.message;

    if (err.name === 'CastError') {
        error = new Error(`Resources not found. Invalid ID format.`);
        error.statusCode = 404;
    }
    if (err.code === 11000) {
        error = new Error(`Duplicate field value entered. That record already exists.`);
        error.statusCode = 400;
    }
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message).join(', ');
        error = new Error(message);
        error.statusCode = 400;
    }
    if (err.name === 'JsonWebTokenError') {
        error = new Error("Invalid Token, Please Login again.");
        error.statusCode = 401;
    }
    if (err.name === 'TokenExpiredError') {
        error = new Error("Your token has expired. Please log in again.");
        error.statusCode = 401;
    }
    const statusCode = error.statusCode || 500;

    console.error(`[Error]: ${error.message}`);

    res.status(statusCode).json({
        success: false,
        message: error.message || "Internal Server Error",
        stack: config.nodeEnv === 'production' ? null : err.stack
    });
};

export default errorHandler;