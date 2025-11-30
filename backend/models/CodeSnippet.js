const mongoose = require('mongoose');

const codeSnippetSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 500
  },
  language: {
    type: String,
    required: true,
    enum: ['javascript', 'python', 'html', 'css', 'json', 'sql', 'rust', 'cpp']
  },
  code: {
    type: String,
    required: true
  },
  output: {
    type: String,
    default: ''
  },
  tags: [{
    type: String,
    trim: true
  }],
  isPublic: {
    type: Boolean,
    default: false
  },
  author: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  runCount: {
    type: Number,
    default: 0
  }
});

codeSnippetSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('CodeSnippet', codeSnippetSchema);
