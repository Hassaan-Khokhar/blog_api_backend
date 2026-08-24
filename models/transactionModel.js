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
            enum: ['DEPOSIT', 'BUY', 'SELL', 'WITHDRAW'],
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
    { timestamps: true }
);

transactionSchema.index({userId: 1, blogId: 1, type: 1 });
transactionSchema.index({ userId: 1, createdAt: -1 });

const Transaction = mongoose.model("Transaction", transactionSchema);
export default Transaction;