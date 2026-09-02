import joi from 'joi';

export const rechargeWalletSchema = joi.object({
    amount: joi.number().strict().greater(0).required(),
    paymentSource: joi.string().required(),
    isSavedCard: joi.boolean().required(),
    shouldSaveCard: joi.boolean().optional().default(false)
});

export const withdrawWalletSchema = joi.object({
    amount: joi.number().greater(0).required(),
});

export const addBankSchema = joi.object({
    bankToken: joi.string().required()
});
