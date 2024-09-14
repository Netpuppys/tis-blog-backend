import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { CategoryValidation } from './category.validation';
import { CategoryController } from './category.controller';

const router = express.Router();

router.get('/', CategoryController.getAllCategory);
router.get('/:id', CategoryController.getSingleCategory);

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
