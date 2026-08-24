import express from "express";
import Blog from "../models/blogModel.js";
import verifyJWT from "../middlewares/requireAuth.js";
import asyncHandler from "../utils/asyncHandler.js";
import { createNewBlog, editBlogService, patchBlogService, getAllBlogsService, getBlogByIdService, getBlogsByUserService, deleteBlogService, purchasedBlogService } from "../services/blogService.js";

const createBlog = asyncHandler(async (req, res) => {

  const blogData = {
    title: req.body.title,
    body: req.body.body,
    snippet: req.body.snippet,
    isPaid: req.body.isPaid,
    price: req.body.price
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
    snippet: req.body.snippet,
    isPaid: req.body.isPaid,
    price: req.body.price
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

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || '';

  const result = await getAllBlogsService(page, limit, search);

  if (!result.blogs || result.blogs.length === 0) {
    return res.status(404).json({ error: "No Blogs Found!" });
  }

  return res.status(200).json(result);
});

const getBlogById = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const viewerId = req.userId;
  const blogById = await getBlogByIdService(id, viewerId);

  if (!blogById) {
    return res.status(404).json({
      error: "Blog Not Found",
    });
  }
  return res.status(200).json({ blogById });
});

const getBlogsByUser = asyncHandler(async (req, res) => {
  const userId = req.params.author;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const result = await getBlogsByUserService(userId, page, limit);

  if (result.blogs.length === 0) {
    return res.status(404).json({
      message: "No Blog by This Author!",
    });
  }
  return res.status(200).json(result);
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

const purchaseBlog = asyncHandler(async (req, res) => {
  const blogId = req.params.id;
  const buyerId = req.userId;

  const result = await purchasedBlogService(buyerId, blogId);

  return res.status(200).json(result);
});

export {
  createBlog,
  updateBlog,
  patchBlog,
  getAllBlogs,
  getBlogById,
  getBlogsByUser,
  deleteBlog,
  purchaseBlog,
};
