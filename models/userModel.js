import mongoose from 'mongoose';
import { type } from 'node:os';

const userSchema = new mongoose.Schema(
    {
        username: { type: String, required: true, unique: true },
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        email: { type: String, required: true },
        password: { type: String, required: true },
        walletBalance: { type: Number, default: 0 },
        refreshToken: { type: [String], default: [] },
        stripeCustomerId: {type: String, default: null},
        stripeAccountId: {type: String, default: null},
        kycCompleted: { type: Boolean, default: false }
    },
    { timestamps: true }
);

const Users = mongoose.model('Users', userSchema);
export default Users;