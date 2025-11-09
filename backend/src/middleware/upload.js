const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Use crypto for secure, unique filenames
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  // Strict MIME type checking
  const allowedMimes = {
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'application/pdf': ['.pdf']
  };

  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedMimes[file.mimetype] && allowedMimes[file.mimetype].includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG images and PDF files are allowed'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit
  fileFilter: fileFilter
});

module.exports = upload;
