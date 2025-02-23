/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */
const SibApiV3Sdk = require('@getbrevo/brevo');
import { env } from '~/config/environment';

let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
let apiKey = apiInstance.authentications['apiKey'];
apiKey.apiKey = env.BREVO_API_KEY;

const sendEmail = async (recipientEmail, customSubject, htmlContent) => {
  // Khoi tao 1 sendSmtEmail voi thong tin can thiet
  let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
  // Tai khoan gui mail
  sendSmtpEmail.sender = {
    email: env.ADMIN_EMAIL_ADDRESS,
    name: env.ADMIN_EMAIL_NAME
  };
  // se la 1 array de sau nay tuy bien co the gui 1 email toi nhieu nguoi (1 nguoi thi van sai mang)
  sendSmtpEmail.to = [{ email: recipientEmail }];
  sendSmtpEmail.subject = customSubject;
  sendSmtpEmail.htmlContent = htmlContent;
  // Goi hanh dong gui mail
  return apiInstance.sendTransacEmail(sendSmtpEmail);
};
export const BrevoProvider = {
  sendEmail
};
