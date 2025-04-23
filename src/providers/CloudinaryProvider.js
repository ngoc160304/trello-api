import cloudinary from 'cloudinary';
import streamifier from 'streamifier';
import { env } from '~/config/environment';
// https://www.youtube.com/redirect?event=video_description&redir_token=QUFFLUhqa1JsRlRkWW5SMDIzTV82VmRySDVXZm9OR3VLUXxBQ3Jtc0tsVW1uS1c2X0xEQ0F1aTVCSk1ISms5NTNmTjdadzFveHdlTWM0VFM4V2x2RVM3dzNjN2t3Q3paaFJUZC1UclRPcHYyRFI3YjdoRVI4dFFoQnpkbTN2UHlxcG1Ya0NKNl85MGs5YWduUGxQUFFhS0wxZw&q=https%3A%2F%2Fwww.npmjs.com%2Fpackage%2Fcloudinary&v=1x7GifqEvZU
const cloudinaryV2 = cloudinary.v2;
cloudinaryV2.config({
  cloud_name: env.CLOUD_NAME,
  api_key: env.CLOUD_API_KEY,
  api_secret: env.CLOUD_API_SECRET
});
// Khởi tạo một cái function để thực hiện upload lên cloudinary
const streamUpload = (fileBuffer, folderName) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinaryV2.uploader.upload_stream(
      {
        folder: folderName
      },
      (err, result) => {
        if (err) reject(err);
        else resolve(result);
      }
    );
    // thực hiện upload cái luồng trên lib streamifierstreamifier
    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};
export const CloudinaryProvider = { streamUpload };
