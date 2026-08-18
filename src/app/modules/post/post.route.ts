import express from 'express';
import { publicCache } from '../../middlewares/publicCache';
import validateRequest from '../../middlewares/validateRequest';
import { PostController } from './post.controller';
import { PostValidation } from './post.validation';

const router = express.Router();

// Public, identical-for-every-visitor reads -> safe to cache at the CDN.
// Write routes below are deliberately left uncached so an edit or a new
// post is written immediately; only the read view lags by s-maxage.
router.get('/', publicCache(), PostController.getAllPost);
router.get('/:slug', publicCache(), PostController.getSinglePost);

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
