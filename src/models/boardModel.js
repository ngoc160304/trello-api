/**
 * Updated by trungquandev.com's author on Oct 8 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */
import Joi from 'joi';
import { ObjectId } from 'mongodb';
import { GET_DB } from '~/config/mongodb';
import { BOARD_TYPES } from '~/utils/constants';
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators';
import { columnModel } from './columnModel';
import { cardModel } from './cardModel';
import { pagingSkipValue } from '~/utils/algorithms';
import { userModel } from './userModel';
const BOARD_COLLECTION_NAME = 'boards';
const BOARD_COLLECTION_SCHEMA = Joi.object({
  title: Joi.string().required().min(3).max(50).trim().strict(),
  slug: Joi.string().required().min(3).trim().strict(),
  description: Joi.string().required().min(3).max(256).trim().strict(),
  type: Joi.string().valid(BOARD_TYPES.PRIVATE, BOARD_TYPES.PUBLIC).required(),
  // Lưu ý các item trong mảng columnOrderIds là ObjectId nên cần thêm pattern cho chuẩn nhé, (lúc quay video số 57 mình quên nhưng sang đầu video số 58 sẽ có nhắc lại về cái này.)
  columnOrderIds: Joi.array()
    .items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE))
    .default([]),
  // admin của boards
  ownerIds: Joi.array()
    .items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE))
    .default([]),
  // nhung thanh vien cua board
  memberIds: Joi.array()
    .items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE))
    .default([]),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
});

// chi ra nhung field ma chung ta khong cho phep cap nhat
const INVALID_UPDATE_FIELDS = ('_id', 'createdAt');
const validateBeforeCreate = async (data) => {
  return await BOARD_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false });
};

const createNew = async (userId, data) => {
  try {
    // const craetedBoard = await GET_DB().collection(BOARD_COLLECTION_NAME).insertOne(data);
    // return craetedBoard;
    const valiData = await validateBeforeCreate(data);
    const newBoard = {
      ...valiData,
      ownerIds: [ObjectId.createFromHexString(userId)]
    };
    return await GET_DB().collection(BOARD_COLLECTION_NAME).insertOne(newBoard);
  } catch (error) {
    throw new Error(error); //cai nay co stack trace con throw error khogn tra ve stack trace
  }
};

const findOneById = async (id) => {
  try {
    const result = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .findOne({
        //  _id: new ObjectId(id),
        _id: ObjectId.createFromHexString(id.toString())
      });
    return result;
  } catch (error) {
    throw new Error(error);
  }
};
const getDetails = async (userId, boardId) => {
  try {
    const queryCondition = [
      // Condition 01: Board chua bi xoa
      { _id: ObjectId.createFromHexString(boardId.toString()) },
      {
        _destroy: false
      },
      // Condition 02: cái thằng userId đang thực hiện request này nó phải thuộc vào trong 2 cái mảng ownerIds hoặc memberIds, sử dụng toán $all của mongodb
      {
        $or: [
          { ownerIds: { $all: [ObjectId.createFromHexString(userId)] } },
          { memberIds: { $all: [ObjectId.createFromHexString(userId)] } }
        ]
      }
    ];
    const result = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .aggregate([
        {
          $match: { $and: queryCondition }
        },
        {
          $lookup: {
            from: columnModel.COLUMN_COLLECTION_NAME,
            localField: '_id', // collection hien tai
            foreignField: 'boardId', // giong nhu khoa ngoai (collection hien tai lien ket voi mot collection khac)
            as: 'columns'
          }
        },
        {
          $lookup: {
            from: cardModel.CARD_COLLECTION_NAME,
            localField: '_id', // collection hien tai
            foreignField: 'boardId', // giong nhu khoa ngoai (collection hien tai lien ket voi mot collection khac)
            as: 'cards'
          }
        },
        {
          $lookup: {
            from: userModel.USER_COLLECTION_NAME,
            localField: 'ownerIds', // collection hien tai
            foreignField: '_id', // giong nhu khoa ngoai (collection hien tai lien ket voi mot collection khac)
            as: 'owners',
            // pipleline trong lookup là để xử lý một hoặc nhiều luông cần thiết
            // $project để chỉ định vài field không muốn lấy về bằng cách gắn nó giá trị 0
            pipeline: [{ $project: { password: 0, verifyToken: 0 } }]
          }
        },
        {
          $lookup: {
            from: userModel.USER_COLLECTION_NAME,
            localField: 'memberIds', // collection hien tai
            foreignField: '_id', // giong nhu khoa ngoai (collection hien tai lien ket voi mot collection khac)
            as: 'member',
            pipeline: [{ $project: { password: 0, verifyToken: 0 } }]
          }
        }
      ])
      .toArray();
    return result[0] || null;
  } catch (error) {
    throw new Error(error);
  }
};

// push columnId to columnOrderIds
const pushColumnOrderIds = async (column) => {
  try {
    const result = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .findOneAndUpdate(
        {
          _id: ObjectId.createFromHexString(column.boardId.toString())
        },
        {
          $push: {
            columnOrderIds: ObjectId.createFromHexString(column._id.toString())
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
const pullColumnOrderIds = async (column) => {
  try {
    const result = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .findOneAndUpdate(
        {
          _id: ObjectId.createFromHexString(column.boardId.toString())
        },
        {
          $pull: {
            columnOrderIds: ObjectId.createFromHexString(column._id.toString())
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
const pushMemberIds = async (boardId, userId) => {
  try {
    const result = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .findOneAndUpdate(
        {
          _id: ObjectId.createFromHexString(boardId.toString())
        },
        {
          $push: {
            memberIds: ObjectId.createFromHexString(userId.toString())
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
const update = async (boardId, updateData) => {
  try {
    Object.keys(updateData).forEach((fieldName) => {
      if (INVALID_UPDATE_FIELDS.includes(fieldName)) {
        delete updateData[fieldName];
      }
    });
    if (updateData.columnOrderIds) {
      updateData.columnOrderIds = updateData.columnOrderIds.map((_id) =>
        ObjectId.createFromHexString(_id.toString())
      );
    }
    const result = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .findOneAndUpdate(
        {
          _id: ObjectId.createFromHexString(boardId.toString())
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
const getBoards = async (userId, page, itemsPerPage, queryFilters) => {
  try {
    const queryCondition = [
      // Condition 01: Board chua bi xoa
      {
        _destroy: false
      },
      // Condition 02: cái thằng userId đang thực hiện request này nó phải thuộc vào trong 2 cái mảng ownerIds hoặc memberIds, sử dụng toán $all của mongodb
      {
        $or: [
          { ownerIds: { $all: [ObjectId.createFromHexString(userId)] } },
          { memberIds: { $all: [ObjectId.createFromHexString(userId)] } }
        ]
      }
    ];
    // xu ly query filter cho tung truong hop search board vi du search theo title
    if (queryFilters) {
      Object.keys(queryFilters).forEach((key) => {
        // co phan biet chua hoa chu thuong
        // khong phan biet chu hoa chu thuong
        // queryCondition.push({
        //   [key]: { $regex: queryFilters[key] }
        // });
        queryCondition.push({
          [key]: { $regex: new RegExp(queryFilters[key], 'i') }
        });
      });
    }
    const query = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .aggregate(
        [
          {
            $match: { $and: queryCondition }
          },
          // sort title 1 sort cai title của board theo tu A - Z (mặc định chữ B hoa sẽ đứng trước chữ a thường (theo chuẩn bảng mã ASCII))
          {
            $sort: {
              title: 1
            }
          },
          // $facet để xử lý nhiều luồng trong một query
          {
            $facet: {
              // Luong 01: Query Boards
              queryBoards: [
                { $skip: pagingSkipValue(page, itemsPerPage) }, // Bỏ qua số lượng bản ghi của những page trước đó

                { $limit: itemsPerPage } // Giới hạn tối đa số lượng bản ghi trên 1 page
              ],
              // Luong 02: Query đếm tổng số lượng tất cả số lượng bản ghi board trong DB và trả về countedAllBoards
              queryTotalBoards: [{ $count: 'countedAllBoards' }]
            }
          }
        ],
        {
          // Khai báo thêm thuộc tính collation locale 'en' để fix vụ B hoa trươc chữ a thường ở trên
          collation: { locale: 'en' }
        }
      )
      .toArray();
    const res = query[0];
    return {
      boards: res.queryBoards || [],
      totalBoards: res.queryTotalBoards[0]?.countedAllBoards || 0
    };
  } catch (error) {
    throw new Error(error);
  }
};

export const boardModel = {
  BOARD_COLLECTION_NAME,
  BOARD_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  getDetails,
  pushColumnOrderIds,
  update,
  pullColumnOrderIds,
  getBoards,
  pushMemberIds
};
