import express from 'express';
import { publicCache } from '../../middlewares/publicCache';
import validateRequest from '../../middlewares/validateRequest';
import { CategoryController } from './category.controller';
import { CategoryValidation } from './category.validation';

const router = express.Router();

// Public, identical-for-every-visitor reads -> safe to cache at the CDN.
router.get('/', publicCache(), CategoryController.getAllCategory);
router.get('/:id', publicCache(), CategoryController.getSingleCategory);

router.get('/:id/posts', publicCache(), CategoryController.getPostsByCategoryId);

router.post(
  '/create-category',
  validateRequest(CategoryValidation.createZodCategory),
  CategoryController.createCategory
);

router.patch(
  '/:id',
  validateRequest(CategoryValidation.updateZodCategory),
  CategoryController.updateCategory
);

router.delete('/:id', CategoryController.deleteCategory);

export const CategoryRoutes = router;
