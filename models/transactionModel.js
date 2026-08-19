import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Users',
            required: true
        },
        type: {
            type: String,
            enum: ['DEPOSIT', 'PURCHASE', 'EARNING'],
            required: true
        },
        amount: {
            type: Number,
            required: true
        },
        blogId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Blog',
            default: null
        },
        description: {
            type: String,
            required: true
        }
    },
    {timestamps: true}
);

const Transaction = mongoose.model("Transaction", transactionSchema);
export default Transaction;