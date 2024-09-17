import { Router } from 'express';
import { upload } from '../../../helpers/multer';
import validateRequest from '../../middlewares/validateRequest';
import { commonController } from './common.controller';
import { commonValidator } from './common.validation';

const CommonRoutes = Router();

CommonRoutes.route('/file-upload').post(
  upload.single('file'),
  validateRequest(commonValidator.fileUpload),
  commonController.uploadFile
);

export default CommonRoutes;
