import express from "express";
import { signUpUser, logInUser, logOutUser, handleRefreshToken, logOutAllDevices } from "../controllers/userController.js";
import verifyJWT from "../middlewares/requireAuth.js";
const authRoute = express.Router();

authRoute.post('/signup', signUpUser);
authRoute.post('/login', logInUser);
authRoute.post('/logout', logOutUser)
authRoute.get('/refresh', handleRefreshToken)

authRoute.post('/logoutAll', verifyJWT, logOutAllDevices);

export default authRoute;