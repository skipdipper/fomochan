const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads');
    },
    filename: function (req, file, cb) {
        // Unix time in seconds
        // cb(null, Math.floor(Date.now() / 1000) + path.extname(file.originalname));
        cb(null, Date.now() + path.extname(file.originalname));

    }
});

const fileFilter = function (req, file, cb) {
    // Accept images only
    if (file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
        cb(null, true);
    } else {
        cb({
            success: false,
            message: 'Invalid file type.'
        }, false);
    }
};

const upload = multer({ storage: storage, fileFilter: fileFilter, limits: { filesize: 4 * 1024 * 1024 } });
exports.upload = upload;

// const upload = multer({ storage: storage, fileFilter: fileFilter, limits: { filesize: 4 * 1024 * 1024 } }).single('image');
// exports.fileUpload = (req, res) => {
//     upload(req, res, function (err) {
//         if (err instanceof multer.MulterError) {
//             if (error.code == 'LIMIT_FILE_SIZE') {
//                 error.message = 'File Size is too large.';
//                 error.success = false;
//             }
//             return res.status(500), json(error);
//         } else if (err) {
//             // An unknown error occurred when uploading.
//             return res.status(500).json('fFle not found');
//         }
//     })
// }; 