/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */
import express from 'express';
// import { columnValidation } from '~/validations/cardValidation';
// import { columnController } from '~/controllers/columnController';
import { userController } from '~/controllers/userController';
import { authMiddleware } from '~/middlewares/authMiddleware';
import { multerUploadMiddleware } from '~/middlewares/multerUploadMiddleware';
// import { columnController } from '~/controllers/columnController';
import { userValidation } from '~/validations/userValidation';
const Router = express.Router();

Router.route('/register').post(userValidation.createNew, userController.createNew);
Router.route('/verify').put(userValidation.verifyAccount, userController.verifyAccount);
Router.route('/login').post(userValidation.login, userController.login);
Router.route('/logout').delete(userController.logout);
Router.route('/refresh_token').get(userController.refreshToken);
Router.route('/update').put(
  authMiddleware.isAuthorized,
  multerUploadMiddleware.upload.single('avatar'),
  userValidation.update,
  userController.update
);
export const userRoutes = Router;
