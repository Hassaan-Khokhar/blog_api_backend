import jwt from 'jsonwebtoken';

const verifyJWT = (req, res, next) => {
    let token;
    if(req.cookies?.accessToken){
        token = req.cookies.accessToken;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')){
        token = req.headers.authorization.split(' ')[1];
    }
    
    if(!token){
        return res.status(401).json({error: "Not Authorized"});
    }

    try {
        const decodedId = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decodedId.userId;
        next();
    } catch (error){
        return res.status(403).json({message: 'invalid or expired token!'});
    }
}

export default verifyJWT;