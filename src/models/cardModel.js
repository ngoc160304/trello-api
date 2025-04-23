import Joi from 'joi';
import { ObjectId } from 'mongodb';
import { GET_DB } from '~/config/mongodb';
import { CARD_MEMBER_ACTIONS } from '~/utils/constants';
import {
  EMAIL_RULE,
  EMAIL_RULE_MESSAGE,
  OBJECT_ID_RULE,
  OBJECT_ID_RULE_MESSAGE
} from '~/utils/validators';
// import { OBJECT_ID_RULE } from '~/utils/validators';
// Define Collection (name & schema)
const CARD_COLLECTION_NAME = 'cards';
const CARD_COLLECTION_SCHEMA = Joi.object({
  boardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  columnId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),

  title: Joi.string().required().min(3).max(50).trim().strict(),
  description: Joi.string().optional(),
  cover: Joi.string().default(null),
  memberIds: Joi.array()
    .items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE))
    .default([]),
  comments: Joi.array()
    .items({
      userId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
      userEmail: Joi.string().pattern(EMAIL_RULE).message(EMAIL_RULE_MESSAGE),
      userAvatar: Joi.string(),
      userDisplayName: Joi.string(),
      content: Joi.string(),
      commentdAt: Joi.date().timestamp('javascript')
    })
    .default([]),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
});

const validateBeforeCreate = async (data) => {
  return await CARD_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false });
};

const createNew = async (data) => {
  try {
    // const craetedBoard = await GET_DB().collection(CARD_COLLECTION_NAME).insertOne(data);
    // return craetedBoard;
    const valiData = await validateBeforeCreate(data);
    const newCardToAdd = {
      ...valiData,
      boardId: ObjectId.createFromHexString(valiData.boardId),
      columnId: ObjectId.createFromHexString(valiData.columnId)
    };
    return await GET_DB().collection(CARD_COLLECTION_NAME).insertOne(newCardToAdd);
  } catch (error) {
    throw new Error(error); //cai nay co stack trace con throw error khogn tra ve stack trace
  }
};

const findOneById = async (id) => {
  try {
    const result = await GET_DB()
      .collection(CARD_COLLECTION_NAME)
      .findOne({
        //  _id: new ObjectId(id),
        _id: ObjectId.createFromHexString(id.toString())
      });
    return result;
  } catch (error) {
    throw new Error(error);
  }
};
const INVALID_UPDATE_FIELDS = ('_id', 'boardId', 'createdAt');

const update = async (cardId, updateData) => {
  try {
    Object.keys(updateData).forEach((fieldName) => {
      if (INVALID_UPDATE_FIELDS.includes(fieldName)) {
        delete updateData[fieldName];
      }
    });
    if (updateData.columnId) {
      updateData.columnId = ObjectId.createFromHexString(updateData.columnId.toString());
    }
    const result = await GET_DB()
      .collection(CARD_COLLECTION_NAME)
      .findOneAndUpdate(
        {
          _id: ObjectId.createFromHexString(cardId.toString())
        },
        {
          $set: updateData
        },
        {
          returnDocument: 'after'
        }
      );
    return result;
  } catch (error) {
    throw new Error(error);
  }
};
const deleteManyByColumnId = async (columnId) => {
  try {
    const result = await GET_DB()
      .collection(CARD_COLLECTION_NAME)
      .deleteMany({
        columnId: ObjectId.createFromHexString(columnId.toString())
      });
    return result;
  } catch (error) {
    throw new Error(error);
  }
};
const unshiftNewComment = async (cardId, updatedData) => {
  try {
    const result = await GET_DB()
      .collection(CARD_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: ObjectId.createFromHexString(cardId) },
        {
          $push: {
            comments: {
              $each: [updatedData],
              $position: 0
            }
          }
        },
        {
          returnDocument: 'after'
        }
      );
    return result;
  } catch (error) {
    throw new Error(error);
  }
};
const updateMembers = async (cardId, incomingMemberInfo) => {
  try {
    let updateCondition = {};
    if (incomingMemberInfo.action === CARD_MEMBER_ACTIONS.ADD) {
      updateCondition = {
        $push: {
          memberIds: ObjectId.createFromHexString(incomingMemberInfo.userId)
        }
      };
    } else {
      updateCondition = {
        $pull: {
          memberIds: ObjectId.createFromHexString(incomingMemberInfo.userId)
        }
      };
    }
    const result = await GET_DB()
      .collection(CARD_COLLECTION_NAME)
      .findOneAndUpdate(
        {
          _id: ObjectId.createFromHexString(cardId)
        },
        updateCondition,
        {
          returnDocument: 'after'
        }
      );
    return result;
  } catch (error) {
    throw new Error(error);
  }
};
export const cardModel = {
  CARD_COLLECTION_NAME,
  CARD_COLLECTION_SCHEMA,
  findOneById,
  createNew,
  update,
  deleteManyByColumnId,
  unshiftNewComment,
  updateMembers
};
