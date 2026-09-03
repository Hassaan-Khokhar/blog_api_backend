import Users from '../models/userModel.js';
import Transaction from '../models/transactionModel.js';
import config from '../config/env.js';
import mongoose from 'mongoose';

const ensureStripeProfiles = async (user) => {
    let updated = false;

    if (!user.stripeCustomerId) {
        const customerReponse = await fetch('https://api.stripe.com/v1/customers', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${config.stripeSecretKey}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `email=${user.email}&name=${user.username}`
        });
        const customerData = await customerReponse.json();

        if (!customerReponse.ok) {
            console.log("Stripe Customer Error:", customerData);
            throw new Error(customerData.error?.message || "Failed to create Stripe Customer");
        }

        user.stripeCustomerId = customerData.id;
        updated = true;
    }

    if (!user.stripeAccountId) {
        const accountResponse = await fetch('https://api.stripe.com/v1/accounts', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${config.stripeSecretKey}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `type=custom&country=AU&capabilities[transfers][requested]=true&business_type=individual&tos_acceptance[date]=${Math.floor(Date.now() / 1000)}&tos_acceptance[ip]=127.0.0.1`

        });

        const accountData = await accountResponse.json();
        if (!accountResponse.ok) {
            console.log("Stripe Account Error:", accountData);
            throw new Error(accountData.error?.message || "Failed to create Stripe Account");
        }

        user.stripeAccountId = accountData.id;
        updated = true;
    }

    if (updated) {
        await user.save();
    }

    return user;
}

const rechargeWalletService = async (userId, amount, paymentSource, isSavedCard, shouldSaveCard) => {
    if (amount <= 0) throw new Error("Recharge amount must be greater than 0.");

    let user = await Users.findById(userId);
    if (!user) throw new Error("User not found!");
    
    user = await ensureStripeProfiles(user);

    let stripeBody;

    if (isSavedCard === true) {
        stripeBody = `amount=${amount * 100}&currency=aud&customer=${user.stripeCustomerId}&source=${paymentSource}&description=Wallet Recharge`;
    } else if (shouldSaveCard === true) {
        const attachResponse = await fetch(`https://api.stripe.com/v1/customers/${user.stripeCustomerId}/sources`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${config.stripeSecretKey}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `source=${paymentSource}`
        });

        const attachData = await attachResponse.json();

        if (!attachResponse.ok) throw new Error(attachData.error?.message || "Failed to save card info during checkout.");

        stripeBody = `amount=${amount * 100}&currency=aud&customer=${user.stripeCustomerId}&source=${attachData.id}&description=Wallet eRecharge`
    }
    else {
        stripeBody = `amount=${amount * 100}&currency=aud&source=${paymentSource}&description=Wallet Recharge`;
    }

    const stripeResponse = await fetch('https://api.stripe.com/v1/charges', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${config.stripeSecretKey}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: stripeBody
    });

    const stripeData = await stripeResponse.json();

    if (!stripeResponse.ok) throw new Error(stripeData.error?.message || "Stripe Payment Failed");

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        user.walletBalance += amount
        await user.save({ session });

        await Transaction.create([{
            userId: userId,
            type: 'DEPOSIT',
            amount: amount,
            description: `Wallet recharge of ${amount}`,
            currentBalance: user.walletBalance,
        }], { session: session });

        await session.commitTransaction();
        session.endSession();

        return user.walletBalance;
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error("TRANSACTION FAILED BECAUSE: ", error);
        throw error;
    }
};

const withdrawWalletService = async (userId, amount) => {

    if (amount <= 0) throw new Error("Withdrawal amount must be greater than 0.");

    let user = await Users.findById(userId);
    if (!user) throw new Error("User not found!");
    if (user.walletBalance < amount) throw new Error("Insufficient funds in your wallet!");

    user = await ensureStripeProfiles(user);

    const accountResponse = await fetch(`https://api.stripe.com/v1/accounts/${user.stripeAccountId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${config.stripeSecretKey}`
        }
    });

    const accountData = await accountResponse.json();

    if (!accountData.external_accounts || accountData.external_accounts.data.length === 0) {
        throw new Error("You must link a Bank Account with your account before requesting for withdrawal!")
    }

    const payoutAmount = amount * 0.95;

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        user.walletBalance -= amount;
        await user.save({ session });

        await Transaction.create([{
            userId: userId,
            type: 'WITHDRAW',
            amount: amount,
            description: `Withdrawal of ${amount} to bank`,
            currentBalance: user.walletBalance
        }], { session: session });

        const stripeResponse = await fetch('https://api.stripe.com/v1/transfers', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${config.stripeSecretKey}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `amount=${payoutAmount * 100}&currency=aud&destination=${user.stripeAccountId}&description=Withdrawal`
        });

        const stripeData = await stripeResponse.json();

        if (!stripeResponse.ok) throw new Error(stripeData.error?.message || "Stripe Payout Failed");

        await session.commitTransaction();
        session.endSession();

        return user.walletBalance;
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error("Transaction Failed Because: ", error);
        throw error;
    }
}

const addBankAccountService = async (userId, bankToken) => {
    let user = await Users.findById(userId);
    if (!user) throw new Error("User not Found!");

    user = await ensureStripeProfiles(user);
    const stripeResponse = await fetch(`https://api.stripe.com/v1/accounts/${user.stripeAccountId}/external_accounts`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${config.stripeSecretKey}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `external_account=${bankToken}`
    });

    const stripeData = await stripeResponse.json();

    if (!stripeResponse.ok) throw new Error(stripeData.error?.message || "Failed to attach bank accounts.");
    return "Bank account successfully linked!"
}

const getTransactionHistoryService = async (userId, page = 1, limit = 10) => {
    const skip = (page - 1) * limit;
    const query = { userId: userId };

    const user = await Users.findById(userId).select('walletBalance');
    const transactions = await Transaction.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit);
    const totalTransactions = await Transaction.countDocuments(query);

    return {
        currentBalance: user.walletBalance,
        transactions: transactions,
        totalPages: Math.ceil(totalTransactions / limit),
        currentPage: page
    };
};

export {
  ensureStripeProfiles,
  rechargeWalletService,
  addBankAccountService,
  withdrawWalletService,
  getTransactionHistoryService
};
