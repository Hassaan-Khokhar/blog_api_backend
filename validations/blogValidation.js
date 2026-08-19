import joi from 'joi';

export const createBlogSchema = joi.object({
    title: joi.string().min(5).max(100).required(),
    snippet: joi.string().min(10).max(200).required(),
    body: joi.string().min(20).required(),
    isPaid: joi.boolean().optional(),
    price: joi.number().min(0).optional()
});

export const updateBlogSchema = joi.object({
    title: joi.string().min(5).max(100).required(),
    snippet: joi.string().min(10).max(200).required(),
    body: joi.string().min(20).required(),
    isPaid: joi.boolean().optional(),
    price: joi.number().min(0).optional()
});
