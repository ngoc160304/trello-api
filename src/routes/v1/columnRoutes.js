/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */
import express from 'express';
// import { columnValidation } from '~/validations/cardValidation';
// import { columnController } from '~/controllers/columnController';
import { columnController } from '~/controllers/columnController';
import { authMiddleware } from '~/middlewares/authMiddleware';
// import { columnController } from '~/controllers/columnController';
import { columnValidation } from '~/validations/columnValidation';

const Router = express.Router();
Router.use(authMiddleware.isAuthorized);
Router.route('/').post(columnValidation.createNew, columnController.createNew);
Router.route('/:id')
  .put(columnValidation.update, columnController.update)
  .delete(columnValidation.deleteItem, columnController.deleteItem);
export const columnRoutes = Router;
