const express = require('express');
const BlogPosts = require('../models/BlogPosts');

const router = express.Router();

router.get('/create', (req, res) => {
  res.render('pages/create', {
    pageTitle: 'Create Blog',
    oldData: {}
  });
});


router.post('/create', async (req, res, next) => {
  try {
    const {
      alt_id,
      title,
      content,
      excerpt,
      author,
      imageUrl,
      imageAlt,
      pin,
      code
    } = req.body;

    if(code !== process.env.CODE){
        return res.status(401).render('pages/create', {
            pageTitle: 'Create Blog',
            error: 'Invalid Security PIN',
            oldData: req.body
        });
    }

    if (!content || !content.trim()) {
      return res.status(400).render('pages/create', {
        pageTitle: 'Create Blog',
        error: 'Blog content cannot be empty.',
        oldData: req.body
      });
    }

    const blog = {
      alt_id: alt_id?.trim() || undefined,
      title: title?.trim() || '',
      content: content.trim(),
      excerpt:
        excerpt?.trim() ||
        content.trim().slice(0, 160),
      author:
        author?.trim() ||
        'Ujwal',
      pin: pin === 'on',
      createdAt: new Date(),
      updatedAt: new Date(),
      deleted: false
    };

    if (imageUrl && imageUrl.trim()) {
      blog.media = {
        url: imageUrl.trim(),
        type: 'image',
        alt:
          imageAlt?.trim() ||
          title?.trim() ||
          'Blog image'
      };
    }

    const post = await BlogPosts.create(blog);

    res.redirect(
      `/blog/${post.alt_id || post._id}`
    );

  } catch (error) {

    if (error.code === 11000) {
      return res.status(400).render('pages/create', {
        pageTitle: 'Create Blog',
        error:
          'This Blog ID already exists. Please choose another one.',
        oldData: req.body
      });
    }

    next(error);
  }
});


module.exports = router;