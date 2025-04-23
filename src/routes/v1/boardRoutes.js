/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */
import express from 'express';
import { boardValidation } from '~/validations/boardValidation';
import { boardController } from '~/controllers/boardController';
import { authMiddleware } from '~/middlewares/authMiddleware';
const Router = express.Router();
Router.use(authMiddleware.isAuthorized);
Router.route('/')
  .get(boardController.getBoards)
  .post(boardValidation.createNew, boardController.createNew);
Router.route('/:id')
  .get(boardController.getDetails)
  .put(boardValidation.update, boardController.update);
Router.route('/supports/moving_card').put(
  boardValidation.moveCardToDifferentColumn,
  boardController.moveCardToDifferentColumn
);
export const boardRoutes = Router;
