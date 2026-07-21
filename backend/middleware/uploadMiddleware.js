const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, 'file-' + uniqueSuffix + ext);
  }
});

/**
 * ALLOWED FILE SIGNATURES (Magic Bytes)
 * Validates the actual binary content, not just the filename extension.
 * Prevents extension spoofing attacks (e.g. "shell.php" renamed to "image.jpg").
 * Reference: https://en.wikipedia.org/wiki/List_of_file_signatures
 */
const ALLOWED_MAGIC_BYTES = {
  jpeg: [0xFF, 0xD8, 0xFF],          // JPEG
  png:  [0x89, 0x50, 0x4E, 0x47],    // PNG
  gif:  [0x47, 0x49, 0x46, 0x38],    // GIF87a / GIF89a
  webp: [0x52, 0x49, 0x46, 0x46]     // WebP (RIFF header)
};

function matchesMagicBytes(buffer, signature) {
  return signature.every((byte, i) => buffer[i] === byte);
}

function isValidImageBuffer(buffer) {
  return Object.values(ALLOWED_MAGIC_BYTES).some(sig => matchesMagicBytes(buffer, sig));
}

// File filter: validates MIME type AND file extension (Layer 1 check)
const fileFilter = (req, file, cb) => {
  const allowedMimes = /image\/(jpeg|jpg|png|gif|webp)/;
  const allowedExts = /\.(jpeg|jpg|png|gif|webp)$/i;

  const validMime = allowedMimes.test(file.mimetype);
  const validExt = allowedExts.test(path.extname(file.originalname));

  if (!validMime || !validExt) {
    return cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'), false);
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

/**
 * Post-upload magic-byte verification middleware (Layer 2 check).
 * Reads the first 8 bytes of the saved file and rejects if binary
 * content does not match a known safe image format signature.
 */
const verifyFileMagicBytes = (req, res, next) => {
  if (!req.file) return next();

  const filePath = req.file.path;
  const buffer = Buffer.alloc(8);
  let fd;
  try {
    fd = fs.openSync(filePath, 'r');
    fs.readSync(fd, buffer, 0, 8, 0);
    fs.closeSync(fd);

    if (!isValidImageBuffer(buffer)) {
      fs.unlinkSync(filePath); // delete the suspicious file immediately
      return res.status(400).json({
        error: 'File content does not match a valid image format. Upload rejected.'
      });
    }
    next();
  } catch (err) {
    if (fd) try { fs.closeSync(fd); } catch {}
    return res.status(500).json({ error: 'File validation error.' });
  }
};

module.exports = { upload, verifyFileMagicBytes };
