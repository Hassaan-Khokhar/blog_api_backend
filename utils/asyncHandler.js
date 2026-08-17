/**
 * @param {import('express').RequestHandler} fn
 * @returns {import('express').RequestHandler}
 */
const asyncHandler = (fn) => {
    return async (req, res, next)=>{
        try {
            await fn(req, res, next);
        } catch (error) {
            res.status(400).json({
                error: "Operation Failed!",
                details: error.message
            });
        }
    };
};

export default asyncHandler;