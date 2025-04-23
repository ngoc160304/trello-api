/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */
import { StatusCodes } from 'http-status-codes';
import { boardService } from '~/services/boardService';
const createNew = async (req, res, next) => {
  try {
    // Dieu huong du lieu sang service
    // Co ket qua tra ve
    // throw new Error();
    const userId = req.jwtDecoded._id;

    const createdBoard = await boardService.createNew(userId, req.body);
    res.status(StatusCodes.CREATED).json(createdBoard);
  } catch (error) {
    next(error);
  }
};
const getDetails = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id;
    const boardId = req.params.id;
    const board = await boardService.getDetails(userId, boardId);
    res.status(StatusCodes.OK).json(board);
  } catch (error) {
    next(error);
  }
};
const update = async (req, res, next) => {
  try {
    const boardId = req.params.id;
    const updatedBoard = await boardService.update(boardId, req.body);
    res.status(StatusCodes.NON_AUTHORITATIVE_INFORMATION).json(updatedBoard);
  } catch (error) {
    next(error);
  }
};
const moveCardToDifferentColumn = async (req, res, next) => {
  try {
    const result = await boardService.moveCardToDifferentColumn(req.body);
    res.status(StatusCodes.NON_AUTHORITATIVE_INFORMATION).json(result);
  } catch (error) {
    next(error);
  }
};
const getBoards = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id;
    const { page, itemPerPage, q } = req.query;
    const queryFilters = q;
    // console.log('queryFilters', queryFilters);
    const result = await boardService.getBoards(userId, page, itemPerPage, queryFilters);
    res.status(StatusCodes.NON_AUTHORITATIVE_INFORMATION).json(result);
  } catch (error) {
    next(error);
  }
};
export const boardController = {
  createNew,
  getDetails,
  update,
  moveCardToDifferentColumn,
  getBoards
};
