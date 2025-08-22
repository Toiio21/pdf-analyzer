const pool = require('../config/database');

class Document {
  static async create(title, format, content, userId) {
    const query = `
      INSERT INTO documents (title, format, content, user_id)
      VALUES ($1, $2, $3, $4) RETURNING *
    `;
    const values = [title, format, content, userId];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  static async findByUserId(userId) {
    const query = `
      SELECT id, title, format, created_at 
      FROM documents 
      WHERE user_id = $1 
      ORDER BY created_at DESC
    `;
    const { rows } = await pool.query(query, [userId]);
    return rows;
  }

  static async findById(id) {
    const query = 'SELECT * FROM documents WHERE id = $1';
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }

  static async delete(id, userId) {
    const query = 'DELETE FROM documents WHERE id = $1 AND user_id = $2';
    await pool.query(query, [id, userId]);
  }
}

module.exports = Document;