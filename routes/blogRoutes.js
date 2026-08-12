import express from 'express';
import * as blogControllers from '../controllers/blogController.js';
import verifyJWT from '../middlewares/requireAuth.js';
const route = express.Router();

route.use(verifyJWT);

route.post('/', blogControllers.createBlog);
route.get('/', blogControllers.getAllBlogs);
route.get('/:id', blogControllers.getBlogById);
route.get('/author/:author', blogControllers.getBlogsByUser);
route.put('/:id', blogControllers.updateBlog);
route.delete('/:id', blogControllers.deleteBlog);

export default route;