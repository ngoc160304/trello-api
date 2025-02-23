import Joi from 'joi';
import { ObjectId } from 'mongodb';
import { GET_DB } from '~/config/mongodb';
import { EMAIL_RULE, EMAIL_RULE_MESSAGE } from '~/utils/validators';
const USER_ROLES = {
  CLIENT: 'client',
  ADMIN: 'admin'
};

const USER_COLLECTION_NAME = 'user';
const USER_COLLECTION_SHEMA = Joi.object({
  email: Joi.string().required().pattern(EMAIL_RULE).message(EMAIL_RULE_MESSAGE),
  password: Joi.string().required(),
  username: Joi.string().required().trim().strict(),
  displayName: Joi.string().required().trim().strict(),
  avatar: Joi.string().default(null),
  role: Joi.string().valid(USER_ROLES.CLIENT, USER_ROLES.ADMIN).default(USER_ROLES.CLIENT),
  isActive: Joi.boolean().default(false),
  verifyToken: Joi.string(),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
});

const INVALID_UPDATE_FIELDS = ['_id', 'email', 'username', 'createdAt'];

const validateBeforeCreate = async (data) => {
  return await USER_COLLECTION_SHEMA.validateAsync(data, { abortEarly: false });
};
const findOneById = async (id) => {
  try {
    const result = await GET_DB()
      .collection(USER_COLLECTION_NAME)
      .findOne({
        //  _id: new ObjectId(id),
        _id: ObjectId.createFromHexString(id.toString()),
        _destroy: false
      });
    return result;
  } catch (error) {
    throw new Error(error);
  }
};
const findOneByEmail = async (email) => {
  try {
    const result = await GET_DB().collection(USER_COLLECTION_NAME).findOne({
      //  _id: new ObjectId(id),
      email: email,
      _destroy: false
    });
    return result;
  } catch (error) {
    throw new Error(error);
  }
};

const createNew = async (data) => {
  try {
    // const craetedBoard = await GET_DB().collection(COLUMN_COLLECTION_NAME).insertOne(data);
    // return craetedBoard;
    const valiData = await validateBeforeCreate(data);
    const newUserToAdd = {
      ...valiData
    };
    return await GET_DB().collection(USER_COLLECTION_NAME).insertOne(newUserToAdd);
  } catch (error) {
    throw new Error(error); //cai nay co stack trace con throw error khogn tra ve stack trace
  }
};

const update = async (userId, updateData) => {
  try {
    Object.keys(updateData).forEach((fieldName) => {
      if (INVALID_UPDATE_FIELDS.includes(fieldName)) {
        delete updateData[fieldName];
      }
    });
    if (updateData.cardOrderIds) {
      updateData.cardOrderIds = updateData.cardOrderIds.map((_id) =>
        ObjectId.createFromHexString(_id.toString())
      );
    }
    const result = await GET_DB()
      .collection(USER_COLLECTION_NAME)
      .findOneAndUpdate(
        {
          _id: ObjectId.createFromHexString(userId.toString())
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
const deleteOneById = async (userId) => {
  try {
    const result = await GET_DB()
      .collection(USER_COLLECTION_NAME)
      .deleteOne({
        _id: ObjectId.createFromHexString(userId.toString())
      });
    return result;
  } catch (error) {
    throw new Error(error);
  }
};
export const userModel = {
  USER_COLLECTION_NAME,
  USER_COLLECTION_SHEMA,
  createNew,
  update,
  findOneByEmail,
  deleteOneById,
  findOneById
};
