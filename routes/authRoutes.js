import express from "express";
import { signUpUser, logInUser, logOutUser, handleRefreshToken, logOutAllDevices, submitKyc } from "../controllers/userController.js";
import validateRequest from "../middlewares/validateRequest.js";
import * as userValidation from "../validations/userValidation.js";
import verifyJWT from "../middlewares/requireAuth.js";
import { getTransactionHistory } from "../controllers/transactionController.js";
const authRoute = express.Router();


authRoute.post('/signup', validateRequest(userValidation.signUpSchema), signUpUser);
authRoute.post('/login', validateRequest(userValidation.logInSchema), logInUser);

authRoute.post('/submit-kyc', verifyJWT, validateRequest(userValidation.submitKycSchema), submitKyc);

authRoute.get('/transactions', verifyJWT, getTransactionHistory);

authRoute.post('/logout', logOutUser);
authRoute.get('/refresh', handleRefreshToken);

authRoute.post('/logoutAll', verifyJWT, logOutAllDevices);

export default authRoute;