/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */
import express from 'express';
import { invitationController } from '~/controllers/invitationController';
import { invitationValidation } from '~/validations/invitationValidation';
import { authMiddleware } from '~/middlewares/authMiddleware';

const Router = express.Router();
Router.use(authMiddleware.isAuthorized);
Router.route('/board').post(
  invitationValidation.createNewBoardInvitation,
  invitationController.createNewBoardInvitation
);
Router.route('/board/:invitationId').put(invitationController.updateBoardInvitation);
// get invitations by user
Router.route('/').get(invitationController.getInvitations);
export const invitationRoutes = Router;
