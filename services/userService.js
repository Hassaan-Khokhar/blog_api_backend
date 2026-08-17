import Users from '../models/userModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

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
    const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ userId: user._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '30d' });

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
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        if (user._id.toString() !== decoded.userId) {
            throw new Error("Token doesn't match the User!");
        }
        const newAccessToken = jwt.sign({ userId: user._id },
            process.env.REFRESH_TOKEN_SECRET,
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

export { signUpUsersService, logInUserService, handleRefreshTokenService, logOutUserService, logOutAllDevicesService }