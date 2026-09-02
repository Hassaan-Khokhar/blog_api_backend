import Blog from '../models/blogModel.js';
import Users from '../models/userModel.js';
import Transaction from '../models/transactionModel.js';
import mongoose from 'mongoose';

const createNewBlog = async (blogData, userId) => {
    const newBlog = await Blog.create({
        ...blogData,
        userId: userId
    });

    return newBlog;
};

const editBlogService = async (blogId, userId, blogData) => {
    const updatedBlog = await Blog.findOneAndUpdate(
        { _id: blogId, userId: userId },
        {
            title: blogData.title,
            body: blogData.body,
            snippet: blogData.snippet
        },
        { new: true }
    );
    return updatedBlog;
};

const patchBlogService = async (blogId, userId, updates) => {
    const patchedBlog = await Blog.findOneAndUpdate(
        { _id: blogId, userId: userId },
        { $set: updates },
        { new: true, runValidators: true }
    );

    return patchedBlog;
};

const getAllBlogsService = async (page = 1, limit = 10, search = '') => {
    const skip = (page - 1) * limit;

    const query = {};
    if (search) {
        query.$text = { $search: search };
    }

    const allBlogs = await Blog.find(query).select('-body -createdAt -updatedAt -__v').sort({ createdAt: -1 }).skip(skip).limit(limit);
    const totalBlogs = await Blog.countDocuments(query);

    return {
        blogs: allBlogs,
        totalPages: Math.ceil(totalBlogs / limit),
        currentPage: page
    };
}

const getBlogByIdService = async (blogId, viewerId) => {
    const blog = await Blog.findById(blogId);
    if (!blog) return null;

    let hasPurchased = false;
    if (viewerId) {
        const recipt = await Transaction.findOne({ userId: viewerId, blogId: blogId, type: 'BUY' });
        if (recipt) hasPurchased = true;
    }

    if (!blog.isPaid || blog.userId.toString() === viewerId || hasPurchased) {
        return blog;
    }

    return {
        _id: blog._id,
        title: blog.title,
        snippet: blog.snippet,
        isPaid: blog.isPaid,
        price: blog.price,
        authorId: blog.userId,
        message: "You must Purchase this blog to read the full body."
    }
}

const getBlogsByUserService = async (authorId, page = 1, limit = 10) => {
    const skip = (page - 1 ) * limit;
    const blogByUser = await Blog.find({ userId: authorId }).sort({ createdAt: -1 }).skip(skip).limit(limit);
    const totalBlogs = await Blog.countDocuments({ userId: authorId });
    return {
        blogs: blogByUser,
        totalPages: Math.ceil(totalBlogs / limit),
        currentPage: page
    };
};

const deleteBlogService = async (blogId, userId) => {
    const deleteBlog = await Blog.findOneAndDelete({
        _id: blogId,
        userId: userId
    });

    return deleteBlog;
};

const purchasedBlogService = async (buyerId, blogId) => {
    const blog = await Blog.findById(blogId);
    if (!blog) throw new Error("Blog Not Found!");
    if (!blog.isPaid) throw new Error("This Blog is Free!");
    if (blog.userId.toString() === buyerId) throw new Error("You cannot buy your own Blog!");
    const existingTransaction = await Transaction.findOne({ userId: buyerId, blogId: blogId, type: 'BUY' });
    if (existingTransaction) throw new Error("You already own this Blog!");

    const buyer = await Users.findById(buyerId);
    const author = await Users.findById(blog.userId);

    if (!author) throw new Error("The author of this blog no longer exists!");
    if (buyer.walletBalance < blog.price) throw new Error("Insufficient funds in your wallet!");

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        buyer.walletBalance -= blog.price;
        author.walletBalance += blog.price;

        const buyerTransaction = new Transaction({
            userId: buyer._id,
            type: 'BUY',
            amount: blog.price,
            blogId: blog._id,
            description: `Purchased Blog: ${blog.title}`
        });

        const authorTransaction = new Transaction({
            userId: author._id,
            type: 'SELL',
            amount: blog.price,
            blogId: blog._id,
            description: `Someone purchased your Blog: ${blog.title}`
        });

        await buyerTransaction.save({ session });
        await authorTransaction.save({ session });


        await buyer.save({ session });
        await author.save({ session });

        await session.commitTransaction();
        session.endSession();

        return { success: true, message: "Purchase successful!" };
    } catch (error) {
        console.error("THE REAL ERROR IS:", error);

        await session.abortTransaction();
        session.endSession();
        throw new Error(`Transaction Failed: ${error.message}`);
    }
};

export {
    createNewBlog,
    editBlogService,
    patchBlogService,
    getAllBlogsService,
    getBlogByIdService,
    getBlogsByUserService,
    deleteBlogService,
    purchasedBlogService
};