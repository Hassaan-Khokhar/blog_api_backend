import express from "express";
import Blog from "../models/blogModel.js";
import verifyJWT from "../middlewares/requireAuth.js";
import asyncHandler from "../utils/asyncHandler.js";

const createBlog = asyncHandler(async (req, res) => {
  const { title, body, snippet } = req.body;
  const securedUserId = req.userId;

  const newBlog = await Blog.create({
    title,
    body,
    userId: securedUserId,
    snippet,
  });

  return res.status(201).json({
    message: "Blog Created Successfully!",
    Blog: newBlog,
  });
});

const updateBlog = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const { title, body, snippet } = req.body;
  const securedUserId = req.userId;

  const updatedBlog = await Blog.findOneAndUpdate(
    { _id: id, userId: securedUserId },
    {
      title,
      body,
      snippet,
    },
    { new: true },
  );

  if (!updatedBlog) {
    return res.status(404).json({ error: "ID Not Found!" });
  }
  return res.status(200).json({
    message: "Blog Updated Successfully!",
    Blog: updatedBlog,
  });
});

const patchBlog = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const userId = req.userId;
  const updates = req.body;

  delete updates.userId;
  delete updates._id;

  const patchedBlog = await Blog.findOneAndUpdate(
    {_id: id, userId: securedUserId},
    {$set: updates},
    {new: true, runValidators: true}
  );

  if(!patchedBlog){
    return res.status(404).json({error: "ID not found or Unauthorized!"});
  }

  return res.status(200).json({
    message: "Blog Patched Successfully!",
    Blog: patchedBlog
  });
  
});

const getAllBlogs = asyncHandler(async (req, res) => {
  const allBlogs = await Blog.find({}).sort({ createdAt: -1 });

  if (!allBlogs || allBlogs.length === 0) {
    return res.status(404).json({ error: "No Blogs Found!" });
  }

  return res.status(200).json({ allBlogs });
});

const getBlogById = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const blogById = await Blog.findById(id);

  if (!blogById) {
    return res.status(404).json({
      error: "Blog Not Found",
    });
  }
  return res.status(200).json({ blogById });
});

const getBlogsByUser = asyncHandler(async (req, res) => {
  const userId = req.params.author;
  const blogsByAuthor = await Blog.find({ userId: userId }).sort({
    createdAt: -1,
  });

  if (blogsByAuthor.length === 0) {
    return res.status(404).json({
      message: "No Blog by This Author!",
    });
  }
  return res.status(200).json({ blogsByAuthor });
});

const deleteBlog = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const securedUserId = req.userId;

  const deletedBlog = await Blog.findOneAndDelete({
    _id: id,
    userId: securedUserId,
  });
  if (!deletedBlog) {
    return res.status(403).json({ error: "Blog Not Found" });
  }

  return res.status(200).json({
    message: "Blog Deleted Successfully!",
  });
});

export {
  createBlog,
  updateBlog,
  patchBlog,
  getAllBlogs,
  getBlogById,
  getBlogsByUser,
  deleteBlog,
};
