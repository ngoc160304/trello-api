import JWT from 'jsonwebtoken';

/**
 * function tạo mới 1 token cần 3 tham số truyền vào
 * userInfo:
 * secretSignature: chữ ký bí mật (dạng một string ngẫu nghiên) trên docs thì để tên là privateKey tùy đều được
 * tokenLife: thời gian sống của token
 */
const generateToken = async (userInfo, secretSignature, tokenLife) => {
  try {
    //
    return JWT.sign(userInfo, secretSignature, {
      algorithm: 'HS256',
      expiresIn: tokenLife
    });
  } catch (error) {
    throw new Error(error);
  }
};

/**
 * function kiem tra token co hop le hay khong
 * Hop le o day hieu don gian la cai token duoc tao ra co dung voi cái chữ ký bí mật secretSignature trong dự án hay không
 */
const verifyToken = async (token, secretSignature) => {
  try {
    //
    return JWT.verify(token, secretSignature);
  } catch (error) {
    throw new Error(error);
  }
};

export const JwtProvider = {
  generateToken,
  verifyToken
};
