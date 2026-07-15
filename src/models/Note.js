const pool = require('../config/database');

class Note {
  // Create a new note
  static async create({ user_id, title, content, category, color }) {
    const query = `
      INSERT INTO notes (user_id, title, content, category, color)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [user_id, title, content, category || 'General', color || '#FFFFFF'];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Get all notes for a user
  static async findAllByUser(user_id, filters = {}) {
    let query = 'SELECT * FROM notes WHERE user_id = $1';
    const values = [user_id];
    let paramCount = 2;

    if (filters.is_archived !== undefined) {
      query += ` AND is_archived = $${paramCount}`;
      values.push(filters.is_archived);
      paramCount++;
    }

    if (filters.category) {
      query += ` AND category = $${paramCount}`;
      values.push(filters.category);
      paramCount++;
    }

    query += ' ORDER BY is_pinned DESC, updated_at DESC';
    
    const result = await pool.query(query, values);
    return result.rows;
  }

  // Get a single note by ID
  static async findById(id, user_id) {
    const query = 'SELECT * FROM notes WHERE id = $1 AND user_id = $2';
    const result = await pool.query(query, [id, user_id]);
    return result.rows[0];
  }

  // Update a note
  static async update(id, user_id, updates) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    const allowedUpdates = ['title', 'content', 'category', 'color', 'is_archived', 'is_pinned'];
    
    for (const [key, value] of Object.entries(updates)) {
      if (allowedUpdates.includes(key)) {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    }

    if (fields.length === 0) return null;

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id, user_id);

    const query = `
      UPDATE notes 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount} AND user_id = $${paramCount + 1}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Delete a note
  static async delete(id, user_id) {
    const query = 'DELETE FROM notes WHERE id = $1 AND user_id = $2 RETURNING *';
    const result = await pool.query(query, [id, user_id]);
    return result.rows[0];
  }

  // Archive all notes
  static async archiveAll(user_id) {
    const query = `
      UPDATE notes 
      SET is_archived = TRUE, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $1 AND is_archived = FALSE
      RETURNING *
    `;
    const result = await pool.query(query, [user_id]);
    return result.rows;
  }

  // Search notes
  static async search(user_id, searchTerm) {
    const query = `
      SELECT * FROM notes 
      WHERE user_id = $1 
      AND (title ILIKE $2 OR content ILIKE $2)
      ORDER BY updated_at DESC
    `;
    const result = await pool.query(query, [user_id, `%${searchTerm}%`]);
    return result.rows;
  }
}

module.exports = Note;