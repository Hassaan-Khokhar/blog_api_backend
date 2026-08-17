import express from "express";
import Blog from "../models/blogModel.js";
import verifyJWT from "../middlewares/requireAuth.js";
import asyncHandler from "../utils/asyncHandler.js";
import { createNewBlog, editBlogService, patchBlogService, getAllBlogsService, getBlogByIdService, getBlogsByUserService, deleteBlogService } from "../services/blogService.js";

const createBlog = asyncHandler(async (req, res) => {

  const blogData = {
    title: req.body.title,
    body: req.body.body,
    snippet: req.body.snippet
  };
  const securedUserId = req.userId;

  const newBlog = await createNewBlog(blogData, securedUserId)

  return res.status(201).json({
    message: "Blog Created Successfully!",
    Blog: newBlog,
  });
});

const updateBlog = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const securedUserId = req.userId;
  const blogData = {
    title: req.body.title,
    body: req.body.body,
    snippet: req.body.snippet
  };

  const updatedBlog = await editBlogService(id, securedUserId, blogData);

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
  const securedUserId = req.userId;
  const updates = req.body;

  delete updates.userId;
  delete updates._id;

  const patchedBlog = await patchBlogService(id, securedUserId, updates);

  if (!patchedBlog) {
    return res.status(404).json({ error: "ID not found or Unauthorized!" });
  }

  return res.status(200).json({
    message: "Blog Patched Successfully!",
    Blog: patchedBlog
  });

});

const getAllBlogs = asyncHandler(async (req, res) => {
  const allBlogs = await getAllBlogsService();

  if (!allBlogs || allBlogs.length === 0) {
    return res.status(404).json({ error: "No Blogs Found!" });
  }

  return res.status(200).json({ allBlogs });
});

const getBlogById = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const blogById = await getBlogByIdService(id);

  if (!blogById) {
    return res.status(404).json({
      error: "Blog Not Found",
    });
  }
  return res.status(200).json({ blogById });
});

const getBlogsByUser = asyncHandler(async (req, res) => {
  const userId = req.params.author;
  const blogsByAuthor = await getBlogsByUserService(userId);

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

  const deletedBlog = await deleteBlogService(id, securedUserId);
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
