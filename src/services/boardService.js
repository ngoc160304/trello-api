/* eslint-disable no-useless-catch */
/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */

// xu ly logic tai day
import { slugify } from '~/utils/formatter';
import { boardModel } from '~/models/boardModel';
import ApiError from '~/utils/ApiError';
import { StatusCodes } from 'http-status-codes';
import { cloneDeep } from 'lodash';
import { columnModel } from '~/models/columnModel';
import { cardModel } from '~/models/cardModel';
const createNew = async (reqBody) => {
  try {
    const newBoard = {
      ...reqBody,
      slug: slugify(reqBody.title)
    };
    const craetedBoard = await boardModel.createNew(newBoard);
    const getNewBoard = await boardModel.findOneById(craetedBoard.insertedId);
    return getNewBoard;
  } catch (error) {
    throw error;
  }
};
const getDetails = async (boardId) => {
  try {
    const board = await boardModel.getDetails(boardId);
    if (!board) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found');
    }
    const resBoard = cloneDeep(board);
    resBoard.columns.forEach((column) => {
      column.cards = resBoard.cards.filter(
        // (card) => card.columnId.toString() === column._id.toString()
        (card) => card.columnId.equals(column._id) // MongoDB trong Object support them ham equals
      );
    });
    delete resBoard.cards;
    return resBoard;
  } catch (error) {
    throw error;
  }
};
const update = async (boardId, reqBody) => {
  try {
    const updateData = {
      ...reqBody,
      updatedAt: Date.now()
    };
    const updatedBoard = await boardModel.update(boardId, updateData);
    return updatedBoard;
  } catch (error) {
    throw error;
  }
};
const moveCardToDifferentColumn = async (reqBody) => {
  try {
    await columnModel.update(reqBody.prevColumnId, {
      cardOrderIds: reqBody.prevCardOrderIds,
      updatedAt: Date.now()
    });
    await columnModel.update(reqBody.nextColumnId, {
      cardOrderIds: reqBody.nextCardOrderIds,
      updatedAt: Date.now(reqBody.currentCardId)
    });
    await cardModel.update(reqBody.currentCardId, {
      columnId: reqBody.nextColumnId
    });
    return {
      updateResult: 'Successfully!'
    };
  } catch (error) {
    throw error;
  }
};
export const boardService = {
  createNew,
  getDetails,
  update,
  moveCardToDifferentColumn
};
