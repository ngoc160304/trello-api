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
 *
 */
import express from 'express';
import { CONNECT_DB, GET_DB } from '~/config/mongodb';
// import { mapOrder } from '~/utils/sorts.js';
import { mapOrder } from '~/utils/sorts';

const START_SERVER = () => {
  const app = express();

  const hostname = 'localhost';
  const port = 8017;

  app.get('/', async (req, res) => {
    // Test Absolute import mapOrder
    console.log(await GET_DB().listCollections().toArray());
    res.end('<h1>Hello World!</h1><hr>');
  });

  app.listen(port, hostname, () => {
    // eslint-disable-next-line no-console
    console.log(`Hello Trung Quan Dev, I am running at ${hostname}:${port}/`);
  });
};

// IIFE js
(async () => {
  try {
    console.log('Connect to MongoDB Cloud Atlas!');
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
