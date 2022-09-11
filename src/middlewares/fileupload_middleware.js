const multer = require("multer");
const path = require("path");
const USER_IMAGE_FOLDER_NAME = process.env.USER_IMAGE_FOLDER_NAME;

const storageEngine = multer.diskStorage({
  destination: USER_IMAGE_FOLDER_NAME,

  filename: function (req, file, fn) {
    fn(
      null,
      new Date().getTime().toString() +
        "_category_" +
        file.fieldname +
        path.extname(file.originalname)
    );
  },
});

const uploadFile = multer({
  storage: storageEngine,
  limits: {
    fileSize: 10000000, // unit in to bytes
  },
  fileFilter(req, file, callback) {
    if (!file) {
      console.log("no file attached......");
    }
    console.log("test file name..." + file.originalname);
    console.log(file.originalname);
    var ext = file.originalname;
    if (!ext.match(/\.(png|jpg|gif|jpeg)$/)) {
      return callback(
        new Error("Only images (.png,.jpg,.gif,.jpeg) are allowed")
      );
    }
    callback(null, true);
  },
});

module.exports = uploadFile;
