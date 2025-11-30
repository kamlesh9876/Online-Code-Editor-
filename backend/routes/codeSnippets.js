const express = require('express');
const router = express.Router();
const CodeSnippet = require('../models/CodeSnippet');

// GET all public code snippets
router.get('/public', async (req, res) => {
  try {
    const { page = 1, limit = 10, language, search } = req.query;
    const query = { isPublic: true };
    
    if (language) query.language = language;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    const snippets = await CodeSnippet.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-code'); // Exclude code from list view
    
    const total = await CodeSnippet.countDocuments(query);
    
    res.json({
      snippets,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET specific snippet by ID
router.get('/:id', async (req, res) => {
  try {
    const snippet = await CodeSnippet.findById(req.params.id);
    if (!snippet) {
      return res.status(404).json({ error: 'Snippet not found' });
    }
    
    // Increment run count
    snippet.runCount += 1;
    await snippet.save();
    
    res.json(snippet);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create new snippet
router.post('/', async (req, res) => {
  try {
    const { title, description, language, code, tags, isPublic, author } = req.body;
    
    if (!title || !language || !code || !author) {
      return res.status(400).json({ 
        error: 'Title, language, code, and author are required' 
      });
    }
    
    const snippet = new CodeSnippet({
      title,
      description,
      language,
      code,
      tags: tags || [],
      isPublic: isPublic || false,
      author
    });
    
    await snippet.save();
    res.status(201).json(snippet);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update snippet
router.put('/:id', async (req, res) => {
  try {
    const snippet = await CodeSnippet.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!snippet) {
      return res.status(404).json({ error: 'Snippet not found' });
    }
    
    res.json(snippet);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE snippet
router.delete('/:id', async (req, res) => {
  try {
    const snippet = await CodeSnippet.findByIdAndDelete(req.params.id);
    if (!snippet) {
      return res.status(404).json({ error: 'Snippet not found' });
    }
    res.json({ message: 'Snippet deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET user's snippets
router.get('/user/:author', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const snippets = await CodeSnippet.find({ author: req.params.author })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await CodeSnippet.countDocuments({ author: req.params.author });
    
    res.json({
      snippets,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
