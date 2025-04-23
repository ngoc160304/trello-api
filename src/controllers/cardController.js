import { StatusCodes } from 'http-status-codes';
import { cardService } from '~/services/cardServiece';
const createNew = async (req, res, next) => {
  try {
    const createdCard = await cardService.createNew(req.body);
    res.status(StatusCodes.CREATED).json(createdCard);
  } catch (error) {
    next(error);
  }
};
const update = async (req, res, next) => {
  try {
    const cardId = req.params.id;
    const cardCoverFile = req.file;
    const userInfo = req.jwtDecoded;
    const updatedCard = await cardService.update(userInfo, cardId, req.body, cardCoverFile);
    res.status(StatusCodes.NON_AUTHORITATIVE_INFORMATION).json(updatedCard);
  } catch (error) {
    next(error);
  }
};
export const cardController = {
  createNew,
  update
};
