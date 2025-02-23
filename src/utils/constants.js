/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */
import { env } from '~/config/environment';

export const WHITELIST_DOMAINS = ['http://localhost:5173'];

export const BOARD_TYPES = {
  PUBLIC: 'public',
  PRIVATE: 'private'
};

export const WEBSITE_DOMAIN =
  env.BUILD_MODE === 'dev' ? env.WEBSITE_DOMAIN_DEVELOPMENT : env.WEBSITE_DOMAIN_PRODUCTION;
