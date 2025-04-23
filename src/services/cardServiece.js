import { cardModel } from '~/models/cardModel';
import { columnModel } from '~/models/columnModel';
import { CloudinaryProvider } from '~/providers/CloudinaryProvider';

const createNew = async (reqBody) => {
  try {
    const newCard = {
      ...reqBody
    };
    const craetedCard = await cardModel.createNew(newCard);
    const getNewCard = await cardModel.findOneById(craetedCard.insertedId);
    if (getNewCard) {
      await columnModel.pushCardOrderIds(getNewCard);
    }
    return getNewCard;
  } catch (error) {
    throw error;
  }
};
const update = async (userInfo, cardId, reqBody, cardCoverFile) => {
  try {
    const updatedData = {
      ...reqBody,
      updatedAt: Date.now()
    };
    let updatedCard = {};
    if (cardCoverFile) {
      // Truong hop upload file len cloudinary
      const uploadResult = await CloudinaryProvider.streamUpload(
        cardCoverFile.buffer,
        'card-covers'
      );
      // Lưu lại url của file ảnh vào trong db
      updatedCard = await cardModel.update(cardId, {
        cover: uploadResult.secure_url
      });
    } else if (updatedData?.commentToAdd) {
      //
      const commentData = {
        ...updatedData.commentToAdd,
        commentdAt: Date.now(),
        userId: userInfo._id,
        userEmail: userInfo.email
      };
      updatedCard = await cardModel.unshiftNewComment(cardId, commentData);
    } else if (updatedData.incomingMemberInfo) {
      updatedCard = await cardModel.updateMembers(cardId, updatedData.incomingMemberInfo);
    } else {
      // Cac truong gop update chung nhu title
      updatedCard = await cardModel.update(cardId, updatedData);
    }
    return updatedCard;
  } catch (error) {
    throw error;
  }
};
export const cardService = {
  createNew,
  update
};
