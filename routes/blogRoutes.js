import express from 'express';
import * as blogControllers from '../controllers/blogController.js';
import verifyJWT from '../middlewares/requireAuth.js';
import validateRequest from '../middlewares/validateRequest.js';
import * as blogValidation from '../validations/blogValidation.js';
const route = express.Router();

route.use(verifyJWT);

route.post('/', validateRequest(blogValidation.createBlogSchema), blogControllers.createBlog);
route.get('/', blogControllers.getAllBlogs);
route.post('/:id/buy', blogControllers.purchaseBlog)
route.get('/:id', blogControllers.getBlogById);
route.get('/author/:author', blogControllers.getBlogsByUser);
route.put('/:id', validateRequest(blogValidation.updateBlogSchema), blogControllers.updateBlog);
route.patch('/:id', validateRequest(blogValidation.updateBlogSchema), blogControllers.patchBlog);
route.delete('/:id', blogControllers.deleteBlog);

export default route;