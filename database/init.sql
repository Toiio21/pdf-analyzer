-- Создание базы данных
CREATE DATABASE pdf_analyzer;

-- Подключение к базе данных
\c pdf_analyzer;

-- Таблица пользователей
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица документов
CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    format VARCHAR(10) NOT NULL,
    content TEXT NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Вставка тестового пользователя
INSERT INTO users (username, email, password) VALUES 
('testuser', 'test@example.com', '$2a$10$2XhziUfFDsBpB2Qr6Yr.2.Fq/yN6QdQ6bZ7QkXfVQ6QdQ6bZ7QkXfV');

-- Вставка тестовых документов
INSERT INTO documents (title, format, content, user_id) VALUES 
('Sample PDF', 'text', 'This is sample text content from a PDF file.', 1),
('Report PDF', 'json', '{"text": "This is sample JSON content from a PDF file.", "metadata": {}, "numpages": 1}', 1);