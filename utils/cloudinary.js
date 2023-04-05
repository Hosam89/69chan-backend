// THIS FILE WILL PROBABLY BE TERMINATED -> PENDING TEAM APPROVAL

// const cloudinary = require('cloudinary').v2;
// const { CloudinaryStorage } = require("multer-storage-cloudinary");
// const dotenv = require('dotenv').config();

// // destruct envs
// const { CLOUD_NAME, API_KEY, API_SECRET } = process.env;

// // export cloudinary configuration
// module.exports.cloudinary = cloudinary.config({
//   cloud_name: CLOUD_NAME,
//   api_key: API_KEY,
//   api_secret: API_SECRET,
// });

// module.exports.storage = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   params: {
//     folder: "profile_pictures",
//     format: async (req, file) => {
//       let format;
//       switch (file.mimetype) {
//         case "image/jpeg":
//           format = "jpg";
//           break;
//         case "image/png":
//           format = "png";
//           break;
//         case "image/gif":
//           format = "gif";
//           break;
//         default:
//           format = "jpg";
//           break;
//       }
//       return format;
//     }, // set desired file format here
//   },
// });
