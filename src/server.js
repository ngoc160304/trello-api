/* eslint-disable no-console */
// eslint
/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */

/**
 * @note
 * controller điều hướng dữ liệu tới service (service là nơi sử lý logic)
 * @babel
 * dùng để biên dịch code js
 * tại sao cần : biên dịch code js cho toàn bộ code để phù hợp với mọi phiên bản trình duyệt
 * @ErrorHandling lỗi tập trung bên backend
 * xử lý ở trong middleware
 * @EvironmentProductionAndDev
 * thư viện cross-env nếu không có cross-env thì sẽ không chạy được trên window
 * cần tạo ra 1 lệnh (hay biến) môi trường env vào script trong package.json
 * liên quan đến vấn đề bảo mật (ví dụ trong môi trường dev sẽ hiển thị ra stack lỗi trong khi prod thì không để tránh hiện cấu trúc thư mực code)
 * @Aggregate qurry tong hop
 * - kieu enum SQL
 */
import express from 'express';
import { CLOSE_DB, CONNECT_DB } from '~/config/mongodb';
import cors from 'cors';
// import { mapOrder } from '~/utils/sorts.js';
// import { mapOrder } from '~/utils/sorts';
import { errorHandlingMiddleware } from './middlewares/errorHandlingMiddleware';
import exitHook from 'async-exit-hook';
import { env } from './config/environment';
import { APIs_V1 } from '~/routes/v1';
import { corsOptions } from './config/cors';
import cookieParser from 'cookie-parser';
const START_SERVER = () => {
  const app = express();
  app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
  });
  app.use(cookieParser());
  app.use(cors(corsOptions));
  app.use(express.json());
  app.use('/v1', APIs_V1);
  app.use(errorHandlingMiddleware);
  app.listen(env.APP_PORT, env.APP_HOST, () => {
    // eslint-disable-next-line no-console
    console.log(`Hello Trung Quan Dev, I am running at ${env.APP_HOST}:${env.APP_PORT}/`);
  });
  exitHook(() => {
    CLOSE_DB();
  });
};

// IIFE js
(async () => {
  try {
    await CONNECT_DB();
    console.log('Connected to MongoDB Cloud Atlas!');
    START_SERVER();
  } catch (error) {
    console.log(error);
    process.exit(0);
  }
})();

// CONNECT_DB()
//   .then(() => console.log('Connect to MongoDB Cloud Atlas!'))
//   .then(() => START_SERVER())
//   .catch((error) => {
//     console.log(error);
//     process.exit(0);
//   });
