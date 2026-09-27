const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema(
  {
    alt_id: { type: String, unique: true },
    title: { type: String, trim: true },
    content: { type: String, trim: true },
    excerpt: { type: String, trim: true },
    author: { type: String, trim: true },
    media: {
      url: String,
      type: String,
      alt: String
    },
    pin: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date },
    deleted: { type: Boolean, default: false }
  },
  {
    collection: 'blogposts'
  }
);

module.exports = mongoose.model('BlogPosts', blogSchema);
