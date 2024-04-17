const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let filePath = path.join(__dirname, '../uploads');
        req.filePath = filePath;
        cb(null, filePath);
    },
    filename: (req, file, cb) => {
        let extname = path.extname(file.originalname);
        let filename = file.originalname.slice(0, (file.originalname.length - extname.length)) + '-' + Date.now() + extname;
        req.filePath = req.filePath + filename;
        cb(null, filename);
    }
});

exports.upload = multer({
    storage
});