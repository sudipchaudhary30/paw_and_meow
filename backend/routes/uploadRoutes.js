const express = require('express');
const upload = require('../middleware/uploadMiddleware');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload an image file.' });
    }

    // Build the absolute URL of the uploaded file
    const protocol = req.protocol;
    const host = req.get('host');
    const imageUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.status(200).json({ 
      message: 'Image uploaded successfully.',
      url: imageUrl
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
