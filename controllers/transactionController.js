import { addBankAccountService, getTransactionHistoryService, rechargeWalletService, withdrawWalletService } from "../services/transactionService.js";
import asyncHandler from "../utils/asyncHandler.js";

const rechargeWallet = asyncHandler(async (req, res) => {
  const { amount, paymentSource, isSavedCard, shouldSaveCard } = req.body;
  const newBalance = await rechargeWalletService(req.userId, amount, paymentSource, isSavedCard, shouldSaveCard);

  return res.status(200).json({
    message: "Wallet recharged successfully!",
    walletBalance: newBalance
  });
});

const withdrawWallet = asyncHandler(async (req, res)=> {
  const {amount} = req.body;
  const newBalance = await withdrawWalletService(req.userId, amount);

  return res.status(200).json({
    message: "Withdrawal Processed successfully!",
    walletBalance: newBalance
  })
});

const addBankAccount = asyncHandler(async (req, res)=> {
  const {bankToken} = req.body;
  const message = await addBankAccountService(req.userId, bankToken);

  return res.status(200).json({message});
});

const getTransactionHistory = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const result = await getTransactionHistoryService(req.userId, page, limit);

  if (!result.transactions || result.transactions.length === 0) {
    return res.status(404).json({ message: "No transaction found" });
  }

  return res.status(200).json(result);
});

export {
  rechargeWallet,
  addBankAccount,
  withdrawWallet,
  getTransactionHistory
};
