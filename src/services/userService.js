import { StatusCodes } from 'http-status-codes';
import { userModel } from '~/models/userModel';
import ApiError from '~/utils/ApiError';
import bcryptjs from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { pickUser } from '~/utils/formatter';
import { WEBSITE_DOMAIN } from '~/utils/constants';
// import { BrevoProvider } from '~/providers/brevoProvider';
import { BrevoProvider } from '~/providers/BrevoProvider';
import { env } from '~/config/environment';
import { JwtProvider } from '~/providers/JwtProvider';
const createNew = async (reqBody) => {
  try {
    const existUser = await userModel.findOneByEmail(reqBody.email);
    if (existUser) {
      throw new ApiError(StatusCodes.CONFLICT, 'Email already exist');
    }
    const nameFromEmail = reqBody.email.split('@')[0];
    const newUser = {
      email: reqBody.email,
      password: bcryptjs.hashSync(reqBody.password, 8), // tham so thu 2 la do phuc tap
      username: nameFromEmail,
      displayName: nameFromEmail, // mac dinh giong username, de lam tinh nang sau nay
      verifyToken: uuidv4()
    };
    // thuc hien luu thong tin user vao database
    const craetedUser = await userModel.createNew(newUser);
    const getNewUser = await userModel.findOneById(craetedUser.insertedId);
    // // Gửi mail xác thực
    const verificationLink = `${WEBSITE_DOMAIN}/account/verification?email=${getNewUser.email}&token=${getNewUser.verifyToken}`;
    const customSubject =
      'Trello MERN Stack Advanced: Please verify your email before using our services';
    const htmlContent = `
      <h3>Here is your verifycation link:</h3>
      <h3>${verificationLink}</h3>
      <h3>Sincerely, <br/> - Trung Quan Dev - Mot lap trinh vien </h3>
    `;
    // Goi toi procider gui email
    await BrevoProvider.sendEmail(getNewUser.email, customSubject, htmlContent);
    return pickUser(getNewUser);
  } catch (error) {
    throw error;
  }
};
const verifyAccount = async (reqBody) => {
  try {
    const existUser = await userModel.findOneByEmail(reqBody.email);
    if (!existUser) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found');
    }
    if (existUser.isActive) {
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your account is already active');
    }
    if (existUser.verifyToken !== reqBody.token) {
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Token is invalid');
    }
    // Neu moi thu OK thi chung ta bat dau update lai thong tin cua user
    const updateData = {
      isActive: true,
      verifyToken: null
    };
    const updatedUser = await userModel.update(existUser._id, updateData);
    return pickUser(updatedUser);
  } catch (error) {
    throw error;
  }
};
const login = async (reqBody) => {
  try {
    const existUser = await userModel.findOneByEmail(reqBody.email);
    if (!existUser) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found');
    }
    if (!existUser.isActive) {
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your account is already active!');
    }
    if (!bcryptjs.compareSync(reqBody.password, existUser.password)) {
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your Email or Password is incorrect!');
    }
    // Neu moi thu ok tao token dang nhap tra lai cho phia FE
    const userInfo = {
      _id: existUser._id,
      email: existUser.email
    };
    const accessToken = await JwtProvider.generateToken(
      userInfo,
      env.ACCESS_TOKEN_SECRET_SIGNATURE,
      // env.ACCESS_TOKEN_LIFE
      15
    );
    const refreshToken = await JwtProvider.generateToken(
      userInfo,
      env.REFRESH_TOKEN_SECRET_SIGNATURE,
      env.REFRESH_TOKEN_LIFE
    );

    // Tao thong tin de dinh kem trong JWT bao gom id va email cua user
    // Tao ra 2 loai token, accessToken va refreshToken de tra ve cho phia FE
    // Tra ve thong tin cua user kem theo 2 cai token vua tao ra
    return { accessToken, refreshToken, ...pickUser(existUser) };
  } catch (error) {
    throw error;
  }
};
const refreshToken = async (clietRefreshToken) => {
  try {
    const refreshTokenDecoded = await JwtProvider.verifyToken(
      clietRefreshToken,
      env.REFRESH_TOKEN_SECRET_SIGNATURE
    );
    const userInfo = {
      _id: refreshTokenDecoded._id,
      email: refreshTokenDecoded.email
    };
    const accessToken = await JwtProvider.generateToken(
      userInfo,
      env.ACCESS_TOKEN_SECRET_SIGNATURE,
      env.ACCESS_TOKEN_LIFE
    );
    return { accessToken };
  } catch (error) {
    throw error;
  }
};
export const userService = {
  createNew,
  verifyAccount,
  login,
  refreshToken
};
