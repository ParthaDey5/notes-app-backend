const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const noteController = require('../controllers/noteController');
const auth = require('../middleware/auth');

// Validation rules
const noteValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('content').optional().trim(),
  body('category').optional().trim(),
  body('color').optional().isHexColor().withMessage('Invalid color format')
];

// All routes are protected with auth middleware
router.use(auth);

// Note routes
router.get('/', noteController.getAllNotes);
router.get('/search', noteController.searchNotes);
router.get('/:id', noteController.getNote);
router.post('/', noteValidation, noteController.createNote);
router.put('/:id', noteValidation, noteController.updateNote);
router.delete('/:id', noteController.deleteNote);
router.post('/archive-all', noteController.archiveAllNotes);

module.exports = router;