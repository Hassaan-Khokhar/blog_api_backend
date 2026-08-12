import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
        username: {type: String, required: true},
        email: {type: String, required: true},
        password: {type: String, required: true},
        refreshToken: {type: [String], default: []}
    },
    {timestamps: true}
);

const Users = mongoose.model('Users', userSchema);
export default Users;