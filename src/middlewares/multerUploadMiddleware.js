import { StatusCodes } from 'http-status-codes';
import multer from 'multer';
import ApiError from '~/utils/ApiError';
import { ALLOW_COMMON_FILE_TYPES, LIMIT_COMMON_FILE_SIZE } from '~/utils/validators';
// function kiem tra loai file nao duoc chap nhan
const customFileFilter = (req, file, callback) => {
  // Đối với multer kiểm tra kiểu file thì sử dụng mimetype
  if (!ALLOW_COMMON_FILE_TYPES.includes(file.mimetype)) {
    const errorMessage = 'File type is invalid. Only accept jpg, jpeg and png';
    return callback(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage), null);
  }
  // Nếu như kiểu file hợp lệ :
  return callback(null, true);
};

// khởi tạo function upload được bọc bới thằng multer
const upload = multer({
  limits: {
    fileSize: LIMIT_COMMON_FILE_SIZE
  },
  fileFilter: customFileFilter
});

export const multerUploadMiddleware = { upload };
