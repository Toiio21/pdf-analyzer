const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const {
  uploadPdf,
  getUserDocuments,
  getDocument,
  deleteDocument
} = require('../controllers/documentController');

router.post('/upload', upload.single('pdf'), uploadPdf);
router.get('/user/:userId', getUserDocuments);
router.get('/:id', getDocument);
router.delete('/:id', deleteDocument);

module.exports = router;