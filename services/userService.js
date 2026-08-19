import Users from '../models/userModel.js';
import Transaction from '../models/transactionModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from '../config/env.js';
import mongoose from 'mongoose';

const signUpUsersService = async (username, email, password) => {
    const existingUser = await Users.findOne({ email });
    if (existingUser) {
        throw new Error('Email already registered!');
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = await Users.create({
        username,
        email,
        password: hashedPassword
    });
    return newUser;
};

const logInUserService = async (email, password) => {
    const user = await Users.findOne({ email });
    if (!user || user === null) {
        throw new Error("Account not Found!");
    }
    const isMatched = bcrypt.compare(password, user.password);
    if (!isMatched) {
        throw new Error("Invalid Password!");
    }
    const accessToken = jwt.sign({ userId: user._id }, config.jwtSecret, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ userId: user._id }, config.refreshTokenSecret, { expiresIn: '30d' });

    if (user.refreshToken.length >= 5) {
        user.refreshToken.shift();
    }
    user.refreshToken.push(refreshToken);
    await user.save();

    return { accessToken, refreshToken };
}

const handleRefreshTokenService = async (refreshToken) => {
    const user = await Users.findOne({ refreshToken });
    if (!user) {
        throw new Error("Refresh Token is Invalid or is Revoked!");
    }
    try {
        const decoded = jwt.verify(refreshToken, config.refreshTokenSecret);
        if (user._id.toString() !== decoded.userId) {
            throw new Error("Token doesn't match the User!");
        }
        const newAccessToken = jwt.sign({ userId: user._id },
            config.refreshTokenSecret,
            { expiresIn: '15m' }
        );
        return newAccessToken;
    } catch (err) {
        throw new Error("Refresh Token Expired or Invalid");

    }
};

const logOutUserService = async (oldRefreshToken) => {
    const user = await Users.findOne({ refreshToken: oldRefreshToken });
    if (user) {
        user.refreshToken = user.refreshToken.filter(
            (token) => token !== oldRefreshToken,
        );
        await user.save();
    }
}

const logOutAllDevicesService = async (userId) => {
    const user = await Users.findById(userId);
    if (!user) {
        throw new Error("user not found!");
    }
    user.refreshToken = [];
    await user.save();
};

const rechargeWalletService = async (userId, amount) => {
    if (amount <= 0) throw new Error("Recharge amount must be greater than 0.");

    const user = await Users.findById(userId);
    if (!user) throw new Error("User not found!");
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        user.walletBalance += amount
        await user.save({ session });

        await Transaction.create({
            userId: userId,
            type: 'DEPOSIT',
            amount: amount,
            description: `Wallet recharge of ${amount}`
        }, { session: session });

        await session.commitTransaction();
        session.endSession();

        return user.walletBalance;
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw new Error("Issue occur while recharge, Ty again!")
    }
};



const getTransactionHistoryService = async (userId, page = 1, limit = 10) => {
    const skip = (page - 1) * limit;
    const query = { userId: userId };


    const transactions = await Transaction.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit);
    const totalTransactions = await Transaction.countDocuments(query);

    return {
        transactions: transactions,
        totalPages: Math.ceil(totalTransactions / limit),
        currentPage: page
    };
};

export {
    signUpUsersService,
    logInUserService,
    handleRefreshTokenService,
    logOutUserService,
    logOutAllDevicesService,
    rechargeWalletService,
    getTransactionHistoryService,
}