import joi from 'joi';

export const signUpSchema = joi.object({
    username: joi.string().pattern(/^(?!.*\.\.)(?!.*_{6})[a-zA-Z0-9]([a-zA-Z0-9._]*[a-zA-Z0-9])?$/).min(3).max(30).required().messages({'string.pattern.base': 'Username can only contain letters, numbers, periods, and up to 5 consecutive underscores. It cannot start or end with a special character, and cannot contain consecutive periods.'}),
    firstName: joi.string().pattern(/^[a-zA-Z\s]+$/).min(2).max(30).required().messages({'string.pattern.base': 'First name can only contain letters.'}),
    lastName: joi.string().pattern(/^[a-zA-Z\s]+$/).min(2).max(30).required().messages({'string.pattern.base': 'Last name can only contain letters.'}),
    email: joi.string().email().required(),
    password: joi.string().min(6).required()
});

export const logInSchema = joi.object({
    email: joi.string().email().required(),
    password: joi.string().min(6).required()
});


export const submitKycSchema = joi.object({
    legalFirstName: joi.string().pattern(/^[a-zA-Z\s]+$/).min(2).max(30).required().messages({'string.pattern.base': 'Legal First Name can only contain letters.'}),
    legalLastName: joi.string().pattern(/^[a-zA-Z\s]+$/).min(2).max(30).required().messages({'string.pattern.base': 'Legal Last Name can only contain letters.'}),
    dob: joi.object({
        day: joi.number().min(1).max(31).required(),
        month: joi.number().min(1).max(12).required(),
        year: joi.number().min(1900).max(new Date().getFullYear() - 18).required() 
    }).required(),
    address: joi.object({
        line1: joi.string().required(),
        city: joi.string().required(),
        state: joi.string().required(),
        postal_code: joi.string().min(3).max(10).required()
    }).required()
});

