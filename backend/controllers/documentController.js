const pdf = require('pdf-parse');
const fs = require('fs');
const Document = require('../models/document');

exports.uploadPdf = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const dataBuffer = fs.readFileSync(req.file.path);
    const pdfData = await pdf(dataBuffer);
    
    const title = req.body.title || req.file.originalname;
    const format = req.body.format || 'text';
    const userId = req.body.userId || 1; // В реальном приложении брать из аутентификации
    
    let content;
    if (format === 'json') {
      content = JSON.stringify({
        text: pdfData.text,
        metadata: pdfData.metadata,
        numpages: pdfData.numpages
      });
    } else {
      content = pdfData.text;
    }
    
    const document = await Document.create(title, format, content, userId);
    
    // Удаляем временный файл
    fs.unlinkSync(req.file.path);
    
    res.json({
      success: true,
      document: {
        id: document.id,
        title: document.title,
        format: document.format,
        content: document.content,
        createdAt: document.created_at
      }
    });
  } catch (error) {
    console.error('Error processing PDF:', error);
    res.status(500).json({ error: 'Failed to process PDF' });
  }
};

exports.getUserDocuments = async (req, res) => {
  try {
    const userId = req.params.userId || 1; // В реальном приложении брать из аутентификации
    const documents = await Document.findByUserId(userId);
    res.json({ success: true, documents });
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
};

exports.getDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }
    res.json({ success: true, document });
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({ error: 'Failed to fetch document' });
  }
};

exports.deleteDocument = async (req, res) => {
  try {
    const userId = req.body.userId || 1; // В реальном приложении брать из аутентификации
    await Document.delete(req.params.id, userId);
    res.json({ success: true, message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
};