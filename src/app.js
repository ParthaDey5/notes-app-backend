const path = require('path');
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');  // ← ADD THIS
require('dotenv').config();

const noteRoutes = require('./routes/noteRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// ============================================
// DATABASE CONNECTION
// ============================================
const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'your_database',
    password: process.env.DB_PASSWORD || 'your_password',
    port: process.env.DB_PORT || 5432,
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../dashboard.html'));
});

// ============================================
// ✅ PUBLIC ROUTE - Live dashboard (NO AUTH)
// MUST come BEFORE the authenticated routes
// ============================================
app.get('/api/notes/live', async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT id, title, content, category, is_pinned, created_at FROM notes ORDER BY created_at ASC LIMIT 20"
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Error in /api/notes/live:', err);
        res.status(500).json({ error: err.message });
    }
});

// ============================================
// AUTHENTICATED ROUTES (require login)
// ============================================
app.use('/api/notes', noteRoutes);  // This likely has auth middleware
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

module.exports = app;