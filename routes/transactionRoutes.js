import express from "express";
import { addBankAccount, getTransactionHistory, rechargeWallet, withdrawWallet } from "../controllers/transactionController.js";
import validateRequest from "../middlewares/validateRequest.js";
import * as transactionValidation from "../validations/transactionValidation.js";
import verifyJWT from "../middlewares/requireAuth.js";
const transactionRoute = express.Router();

transactionRoute.post('/recharge', verifyJWT, validateRequest(transactionValidation.rechargeWalletSchema), rechargeWallet);
transactionRoute.post('/add-bank', verifyJWT, validateRequest(transactionValidation.addBankSchema), addBankAccount);
transactionRoute.post('/withdraw', verifyJWT, validateRequest(transactionValidation.withdrawWalletSchema), withdrawWallet);

export default transactionRoute;
