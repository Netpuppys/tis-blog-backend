import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { CategoryController } from './category.controller';
import { CategoryValidation } from './category.validation';

const router = express.Router();

router.get('/', CategoryController.getAllCategory);
router.get('/:id', CategoryController.getSingleCategory);

router.get('/:id/posts', CategoryController.getPostsByCategoryId);

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
