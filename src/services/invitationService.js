import { StatusCodes } from 'http-status-codes';
import { boardModel } from '~/models/boardModel';
import { invitationModel } from '~/models/invitationModel';
import { userModel } from '~/models/userModel';
import ApiError from '~/utils/ApiError';
import { BOARD_INVITATION_STATUS, INVITATION_TYPES } from '~/utils/constants';
import { pickUser } from '~/utils/formatter';

const createNewBoardInvitation = async (reqBody, inviterId) => {
  try {
    const inviter = await userModel.findOneById(inviterId);
    const invitee = await userModel.findOneByEmail(reqBody.inviteeEmail);
    const board = await boardModel.findOneById(reqBody.boardId);
    if (!invitee || !inviter || !board) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Inviter, invitee or board is not found !');
    }
    const newInvitationData = {
      inviterId,
      inviteeId: invitee._id.toString(),
      type: INVITATION_TYPES.BOARD_INVITATION,
      boardInvitation: {
        boardId: board._id.toString(),
        status: BOARD_INVITATION_STATUS.PENDING
      }
    };
    const createdInvitation = await invitationModel.createNewBoardInvitation(newInvitationData);
    const getNewInvitation = await invitationModel.findOneById(
      createdInvitation.insertedId.toString()
    );
    return {
      ...getNewInvitation,
      board,
      inviter: pickUser(inviter),
      invitee: pickUser(invitee)
    };
  } catch (error) {
    throw error;
  }
};
const getInvitations = async (userId) => {
  try {
    const getInvitation = await invitationModel.findByUser(userId);
    const resInvitation = getInvitation.map((i) => {
      return {
        ...i,
        inviter: i.inviter[0] || {},
        invitee: i.invitee[0] || {},
        board: i.board[0] || {}
      };
    });
    return resInvitation;
  } catch (error) {
    throw error;
  }
};
const updateBoardInvitation = async (userId, invitationId, status) => {
  try {
    const getInvitation = await invitationModel.findOneById(invitationId);
    if (!getInvitation) throw ApiError(StatusCodes.NOT_FOUND, 'Invitation not found');
    const boardId = getInvitation.boardInvitation.boardId;
    const getBoard = await boardModel.findOneById(boardId);
    if (!getBoard) throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found');
    // Kiem tra xem user da ton tai trong board chua neu co thi throw loi
    const boardOwnerAndMemberIds = [...getBoard.ownerIds, ...getBoard.memberIds].toString();
    if (status === BOARD_INVITATION_STATUS.ACCEPTED && boardOwnerAndMemberIds.includes(userId)) {
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'You are already a member of this board');
    }
    // Tao du lieu de update
    const updateData = {
      boardInvitation: {
        ...getInvitation.boardInvitation,
        status
      }
    };
    // B1: cap nhat lai status trong record
    const updatedInvitation = await invitationModel.update(invitationId, updateData);
    // B2: them user id vao board neu status la accept
    if (updatedInvitation.boardInvitation.status === BOARD_INVITATION_STATUS.ACCEPTED) {
      await boardModel.pushMemberIds(boardId, userId);
    }
    return updatedInvitation;
  } catch (error) {
    throw error;
  }
};
export const invitationService = {
  createNewBoardInvitation,
  getInvitations,
  updateBoardInvitation
};
