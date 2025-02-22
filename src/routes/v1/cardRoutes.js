/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */
import express from 'express';
import { cardValidation } from '~/validations/cardValidation';
import { cardController } from '~/controllers/cardController';
import { authMiddleware } from '~/middlewares/authMiddleware';
const Router = express.Router();
Router.use(authMiddleware.isAuthorized);
Router.route('/').post(cardValidation.createNew, cardController.createNew);

export const cardRoutes = Router;
