const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const documentRoutes = require('./routes/documents');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Роуты
app.use('/api/documents', documentRoutes);

// Статическая папка для загрузок
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Базовая route
app.get('/', (req, res) => {
  res.json({ message: 'PDF Analyzer API' });
});

// Обработка ошибок
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large' });
    }
  }
  res.status(500).json({ error: error.message });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});