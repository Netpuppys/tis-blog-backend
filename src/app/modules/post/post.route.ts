import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { PostController } from './post.controller';
import { PostValidation } from './post.validation';

const router = express.Router();

router.get('/', PostController.getAllPost);
router.get('/:id', PostController.getSinglePost);

router.post(
  '/create-post',
  validateRequest(PostValidation.createZodPost),
  PostController.createPost
);

router.patch(
  '/:id',
  validateRequest(PostValidation.updateZodPost),
  PostController.updatePost
);

router.delete('/:id', PostController.deletePost);

export const PostRoutes = router;
