import joi from 'joi';

export const createBlogSchema = joi.object({
    title: joi.string().min(5).max(100).required(),
    snippet: joi.string().min(10).max(200).required(),
    body: joi.string().min(20).required(),
    isPaid: joi.boolean().optional(),
    price: joi.number().when('isPaid', {
        is: true,
        then: joi.number().greater(0).required().messages({
            'number.greater': 'A Paid blog must have a price greater than 0!',
            'any.required': 'You must provide a price if the blog is Paid!'
        }),
        otherwise: joi.number().valid(0).optional().messages({
            'any.only': 'A Free blog must have a price of exactly 0.'
        })
    })

});

export const updateBlogSchema = joi.object({
    title: joi.string().min(5).max(100).required(),
    snippet: joi.string().min(10).max(200).required(),
    body: joi.string().min(20).required(),
    isPaid: joi.boolean().optional(),
    price: joi.number().when('isPaid', {
        is: true,
        then: joi.number().greater(0).required().messages({
            'number.greater': 'A Paid blog must have a price greater than 0!',
            'any.required': 'You must provide a price if the blog is Paid!'
        }),
        otherwise: joi.number().valid(0).optional().messages({
            'any.only': 'A Free blog must have a price of exactly 0.'
        })
    })

});
