import Users from '../models/userModel.js';
import Transaction from '../models/transactionModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from '../config/env.js';
import mongoose from 'mongoose';
import { ensureStripeProfiles } from './transactionService.js';


const submitKycService = async (userId, kycData) =>{
    let user = await Users.findById(userId);
    if(!user) throw new Error("User not Found!");
    if(user.kycCompleted) throw new Error("KYC is already completed!");

    user = await ensureStripeProfiles(user);

    const stripeResponse = await fetch(`https://api.stripe.com/v1/accounts/${user.stripeAccountId}`, {
        method: 'POST', 
        headers: {
            'Authorization': `Bearer ${config.stripeSecretKey}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `individual[dob][day]=${kycData.dob.day}&individual[dob][month]=${kycData.dob.month}&individual[dob][year]=${kycData.dob.year}&individual[address][line1]=${kycData.address.line1}&individual[address][city]=${kycData.address.city}&individual[address][state]=${kycData.address.state}&individual[address][postal_code]=${kycData.address.postal_code}&individual[first_name]=${kycData.legalFirstName}&individual[last_name]=${kycData.legalLastName}&individual[verification][document][front]=file_identity_document_success&business_profile[product_description]=Independent%20writer%20selling%20blogs%20on%20this%20platform`
    });

    const stripeData = await stripeResponse.json();
    if (!stripeResponse.ok) throw new Error(stripeData.error?.message || "Stripe rejected KYC data");

    user.kycCompleted = true;
    
    await user.save();

    return "KYC securely processed and sent to Stripe!";
} 



const signUpUsersService = async (username, email, password, firstName, lastName) => {
    const existingUsername = await Users.findOne({ username });
    if (existingUsername) {
        throw new Error('Username is already in use!');
    }

    const existingUser = await Users.findOne({ email });
    if (existingUser) {
        throw new Error('Email already registered!');
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = await Users.create({
        username,
        email,
        password: hashedPassword,
        firstName,
        lastName
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
    const accessToken = jwt.sign({ userId: user._id, nonce: crypto.randomUUID() }, config.jwtSecret, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ userId: user._id, nonce: crypto.randomUUID() }, config.refreshTokenSecret, { expiresIn: '30d' });

    if (user.refreshToken.length >= 5) {
        user.refreshToken.shift();
    }
    user.refreshToken.push(refreshToken);
    await user.save();

    return { accessToken, refreshToken };
}

const handleRefreshTokenService = async (refreshToken) => {
    let decoded;
    try {
        decoded = jwt.verify(refreshToken, config.refreshTokenSecret);
    } catch (err) {
        throw new Error("Refresh Token Expired or is Revoked!");
    }

    const user = await Users.findOne({ _id: decoded.userId });

    if (!user) throw new Error("User not Found!");

    if (!user.refreshToken.includes(refreshToken)) {
        user.refreshToken = [];
        await user.save();
        throw new Error("Security ALERT: Token reuse Detected. All sessions have been revoked!");
    }

    user.refreshToken = user.refreshToken.filter(token => token !== refreshToken);

    const newAccessToken = jwt.sign({ userId: user._id, nonce: crypto.randomUUID() },
        config.jwtSecret,
        { expiresIn: '15m' }
    );
    const newRefreshToken = jwt.sign(
        { userId: user._id, nonce: crypto.randomUUID() },
        config.refreshTokenSecret,
        { expiresIn: '30d' }
    )

    user.refreshToken.push(newRefreshToken);
    await user.save();

    return { newAccessToken, newRefreshToken };

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



export {
  signUpUsersService,
  logInUserService,
  handleRefreshTokenService,
  logOutUserService,
  logOutAllDevicesService,
  submitKycService
};