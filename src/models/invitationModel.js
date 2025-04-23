import Joi from 'joi';
import { ObjectId } from 'mongodb';
import { GET_DB } from '~/config/mongodb';
import { BOARD_INVITATION_STATUS, INVITATION_TYPES } from '~/utils/constants';
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators';
import { userModel } from './userModel';
import { boardModel } from './boardModel';

const INVITATION_COLLECTION_NAME = 'invitations';
const INVITATION_COLLECTION_SHEMA = Joi.object({
  inviterId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  inviteeId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  type: Joi.string()
    .required()
    .valid(...Object.values(INVITATION_TYPES)),
  boardInvitation: Joi.object({
    boardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    status: Joi.string()
      .required()
      .valid(...Object.values(BOARD_INVITATION_STATUS))
  }).optional(),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
});
const findOneById = async (id) => {
  try {
    const result = await GET_DB()
      .collection(INVITATION_COLLECTION_NAME)
      .findOne({
        //  _id: new ObjectId(id),
        _id: ObjectId.createFromHexString(id),
        _destroy: false
      });
    return result;
  } catch (error) {
    throw new Error(error);
  }
};
const INVALID_UPDATE_FIELDS = ['_id', 'inviterId', 'inviteeId', 'type', 'createdAt'];
const validateBeforeCreate = async (data) => {
  return await INVITATION_COLLECTION_SHEMA.validateAsync(data, { abortEarly: false });
};
const createNewBoardInvitation = async (data) => {
  try {
    const validData = await validateBeforeCreate(data);
    let newInvitationtToAdd = {
      ...validData,
      inviterId: ObjectId.createFromHexString(validData.inviterId),
      inviteeId: ObjectId.createFromHexString(validData.inviteeId)
    };
    if (validData.boardInvitation) {
      newInvitationtToAdd.boardInvitation = {
        ...validData.boardInvitation,
        boardId: ObjectId.createFromHexString(validData.boardInvitation.boardId)
      };
    }
    return await GET_DB().collection(INVITATION_COLLECTION_NAME).insertOne(newInvitationtToAdd);
  } catch (error) {
    throw new Error(error);
  }
};
const update = async (invitationId, updateData) => {
  try {
    Object.keys(updateData).forEach((fieldName) => {
      if (INVALID_UPDATE_FIELDS.includes(fieldName)) {
        delete updateData[fieldName];
      }
    });
    if (updateData.boardInvitation) {
      updateData.boardInvitation = {
        ...updateData.boardInvitation
      };
    }
    const result = await GET_DB()
      .collection(INVITATION_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: ObjectId.createFromHexString(invitationId) },
        { $set: updateData },
        { returnDocument: 'after' }
      );
    return result;
  } catch (error) {
    throw new Error(error);
  }
};
const findByUser = async (userId) => {
  try {
    const queryCondition = [
      // Condition 01: Board chua bi xoa
      { inviteeId: ObjectId.createFromHexString(userId) },
      {
        _destroy: false
      }
    ];
    const results = await GET_DB()
      .collection(INVITATION_COLLECTION_NAME)
      .aggregate([
        {
          $match: { $and: queryCondition }
        },
        {
          $lookup: {
            from: userModel.USER_COLLECTION_NAME,
            localField: 'inviterId', // collection hien tai
            foreignField: '_id', // giong nhu khoa ngoai (collection hien tai lien ket voi mot collection khac)
            as: 'inviter',
            // pipleline trong lookup là để xử lý một hoặc nhiều luông cần thiết
            // $project để chỉ định vài field không muốn lấy về bằng cách gắn nó giá trị 0
            pipeline: [{ $project: { password: 0, verifyToken: 0 } }]
          }
        },
        {
          $lookup: {
            from: userModel.USER_COLLECTION_NAME,
            localField: 'inviteeId', // collection hien tai
            foreignField: '_id', // giong nhu khoa ngoai (collection hien tai lien ket voi mot collection khac)
            as: 'invitee',
            // pipleline trong lookup là để xử lý một hoặc nhiều luông cần thiết
            // $project để chỉ định vài field không muốn lấy về bằng cách gắn nó giá trị 0
            pipeline: [{ $project: { password: 0, verifyToken: 0 } }]
          }
        },
        {
          $lookup: {
            from: boardModel.BOARD_COLLECTION_NAME,
            localField: 'boardInvitation.boardId', // collection hien tai
            foreignField: '_id', // giong nhu khoa ngoai (collection hien tai lien ket voi mot collection khac)
            as: 'board'
          }
        }
      ])
      .toArray();
    return results;
  } catch (error) {
    throw new Error(error);
  }
};
export const invitationModel = {
  INVITATION_COLLECTION_NAME,
  INVITATION_COLLECTION_SHEMA,
  findOneById,
  createNewBoardInvitation,
  update,
  findByUser
};
