import { StatusCodes } from 'http-status-codes';
import { JwtProvider } from '~/providers/JwtProvider';
import { env } from '~/config/environment';
import ApiError from '~/utils/ApiError';
const isAuthorized = async (req, res, next) => {
  // lay acctoken nam trong request cookie phia client gui len
  const clientAccessToken = req.cookies?.accessToken;

  // neu nhu cai clientAccesstoken khong ton tai tra loi
  if (!clientAccessToken) {
    next(new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized: {token not found}'));
    return;
  }
  try {
    // thuc hien giai ma token
    const accessTokenDecoded = await JwtProvider.verifyToken(
      clientAccessToken,
      env.ACCESS_TOKEN_SECRET_SIGNATURE
    );
    // neu token ok luu thong tin vao req.jwtDecoded, de su dung cac tang phia duoi
    req['jwtDecoded'] = accessTokenDecoded;
    // cho request di tiep
    next();
  } catch (error) {
    // neu accesstoken bi het han thi minh tra ma loi GONE - 410 cho FE biet de goi api refreshToken
    if (error?.message?.includes('jwt expired')) {
      next(new ApiError(StatusCodes.GONE, 'Need to refresh token !'));
      return;
    }
    next(new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized !'));
    // accessToken k hop le tra ve cho fe loi 401 r cho sign out luon
  }
};
export const authMiddleware = {
  isAuthorized
};
