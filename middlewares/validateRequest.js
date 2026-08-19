import errorHandler from "./errorHandler.js";

const validateRequest = (schema) => {
    return(req, res, next) =>{
        const {error} = schema.validate(req.body, {abortEarly: false});
        if(error){
            const errorMessages = error.details.map(details => details.message).join(', ');
            const validationError = new Error(errorMessages);
            validationError.statusCode = 400;
            return next(validationError);
        }
        next();
    }
}
export default validateRequest;