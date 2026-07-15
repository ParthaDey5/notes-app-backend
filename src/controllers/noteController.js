const Note = require('../models/Note');
const { validationResult } = require('express-validator');

exports.getAllNotes = async (req, res) => {
  try {
    const { archived, category } = req.query;
    const filters = {};
    
    if (archived === 'true') filters.is_archived = true;
    else if (archived === 'false') filters.is_archived = false;
    if (category) filters.category = category;

    const notes = await Note.findAllByUser(req.user.id, filters);
    res.json({ success: true, data: notes });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id, req.user.id);
    if (!note) {
      return res.status(404).json({ success: false, error: 'Note not found' });
    }
    res.json({ success: true, data: note });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.createNote = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { title, content, category, color } = req.body;
    const note = await Note.create({
      user_id: req.user.id,
      title,
      content,
      category,
      color
    });
    
    res.status(201).json({ success: true, data: note });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateNote = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const note = await Note.update(req.params.id, req.user.id, req.body);
    if (!note) {
      return res.status(404).json({ success: false, error: 'Note not found' });
    }
    
    res.json({ success: true, data: note });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteNote = async (req, res) => {
  try {
    const note = await Note.delete(req.params.id, req.user.id);
    if (!note) {
      return res.status(404).json({ success: false, error: 'Note not found' });
    }
    
    res.json({ success: true, message: 'Note deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.archiveAllNotes = async (req, res) => {
  try {
    const notes = await Note.archiveAll(req.user.id);
    res.json({ success: true, message: `${notes.length} notes archived` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.searchNotes = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ success: false, error: 'Search query required' });
    }
    
    const notes = await Note.search(req.user.id, q);
    res.json({ success: true, data: notes });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};