import joi from 'joi';

export const signUpSchema = joi.object({
    username: joi.string().pattern(/^(?!(?:[^ ]* ){4})[a-zA-Z ]*$/).min(3).max(30).required().messages({'string.pattern.base': 'Name can only contain letters and spaces.'}),
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