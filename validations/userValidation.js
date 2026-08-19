import joi from 'joi';

export const signUpSchema = joi.object({
    username: joi.string().min(3).max(30).required(),
    email: joi.string().email().required(),
    password: joi.string().min(6).required()
});

export const logInSchema = joi.object({
    email: joi.string().email().required(),
    password: joi.string().min(6).required()
});

export const rechargeWalletSchema = joi.object({
    amount: joi.number().strict().greater(0).required()
});