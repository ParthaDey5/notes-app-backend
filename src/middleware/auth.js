const jwt = require('jsonwebtoken');
const pool = require('../config/database');

module.exports = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await pool.query(
      'SELECT id, username, email FROM users WHERE id = $1',
      [decoded.id]
    );

    if (user.rows.length === 0) {
      throw new Error();
    }

    req.user = user.rows[0];
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ success: false, error: 'Please authenticate' });
  }
};