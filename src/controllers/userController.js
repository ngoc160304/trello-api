import { StatusCodes } from 'http-status-codes';
import { userService } from '~/services/userService';
import ms from 'ms';
import ApiError from '~/utils/ApiError';
const createNew = async (req, res, next) => {
  try {
    const createdUser = await userService.createNew(req.body);
    res.status(StatusCodes.CREATED).json(createdUser);
  } catch (error) {
    next(error);
  }
};
const verifyAccount = async (req, res, next) => {
  try {
    const result = await userService.verifyAccount(req.body);
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};
const login = async (req, res, next) => {
  try {
    const result = await userService.login(req.body);
    // tra ve http only cookie cho trinh duyet
    res.cookie('accessToken', result.accessToken, {
      httpOnly: true, // phia server phan li, fe khong lam gi
      secure: true, // bao mat
      sameSite: 'none', // kieu nhu fe chay cong khac, be chay cong khac de none de khong bi conflict giua 2 cong
      maxAge: ms('14 days')
    });
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true, // phia server phan li, fe khong lam gi
      secure: true, // bao mat
      sameSite: 'none', // kieu nhu fe chay cong khac, be chay cong khac de none de khong bi conflict giua 2 cong
      maxAge: ms('14 days')
    });
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};
const logout = async (req, res, next) => {
  try {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.status(StatusCodes.OK).json({
      loggedOut: true
    });
  } catch (error) {
    next(error);
  }
};
const refreshToken = async (req, res, next) => {
  try {
    const result = await userService.refreshToken(req.cookies?.refreshToken);
    res.cookie('accessToken', result.accessToken, {
      httpOnly: true, // phia server phan li, fe khong lam gi
      secure: true, // bao mat
      sameSite: 'none', // kieu nhu fe chay cong khac, be chay cong khac de none de khong bi conflict giua 2 cong
      maxAge: ms('14 days')
    });
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(new ApiError(StatusCodes.FORBIDDEN, 'Please Sign In! (Error from refresh Token'));
  }
};
export const userController = {
  createNew,
  verifyAccount,
  login,
  logout,
  refreshToken
};
