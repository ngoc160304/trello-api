/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */
import express from 'express';
import { StatusCodes } from 'http-status-codes';
import { boardRoutes } from './boardRoutes';
import { columnRoutes } from './columnRoutes';
import { cardRoutes } from './cardRoutes';
import { userRoutes } from './userRoutes';
const Router = express.Router();

/** check api v1/status*/
Router.get('/status', (req, res) => {
  res.status(StatusCodes.OK).json({
    message: 'API test'
  });
});
/** Boards API*/
Router.use('/boards', boardRoutes);
/** Column API*/
Router.use('/columns', columnRoutes);
/** Card API*/
Router.use('/cards', cardRoutes);
/** User API */
Router.use('/users', userRoutes);

export const APIs_V1 = Router;
