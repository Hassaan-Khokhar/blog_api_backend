import Blog from '../models/blogModel.js';

const createNewBlog = async(blogData, userId)=>{
    const newBlog = await Blog.create({
        ...blogData,
        userId: userId
    });

    return newBlog;
};

const editBlogService = async(blogId, userId, blogData) => {
    const updatedBlog = await Blog.findOneAndUpdate(
        {_id: blogId, userId: userId},
        {
            title: blogData.title,
            body: blogData.body,
            snippet: blogData.snippet
        },
        {new: true}
    );
    return updatedBlog;
};

const patchBlogService = async (blogId, userId, updates) =>{
    const patchedBlog = await Blog.findOneAndUpdate(
        {_id: blogId, userId: userId},
        {$set: updates},
        {new: true, runValidators: true}
    );

    return patchedBlog;
};

const getAllBlogsService = async () => {
    const allBlogs = await Blog.find({}).sort({createdAt: -1});

    return allBlogs;
}

const getBlogByIdService = async(blogId) => {
    const blogById = await Blog.findOne({_id: blogId});
    return blogById;
}

const getBlogsByUserService = async (authorId)=>{
    const blogByUser = await Blog.find({userId: authorId}).sort({createdAt: -1});
    return blogByUser;
};

const deleteBlogService = async(blogId, userId)=>{
    const deleteBlog = await Blog.findOneAndDelete({
        _id: blogId,
        userId: userId 
    });

    return deleteBlog;
};



export {createNewBlog, editBlogService, patchBlogService, getAllBlogsService, getBlogByIdService, getBlogsByUserService, deleteBlogService};