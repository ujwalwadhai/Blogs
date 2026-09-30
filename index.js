const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const BlogPosts = require('./models/BlogPosts');
const app = express();

app.use(express.json())
app.use(express.urlencoded({extended: false}))

app.use(require('./routes/create'));

function getTitle(post) {
  if (post.title && post.title.trim()) return post.title.trim();
  const raw = post.content || '';
  const plain = raw.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  return plain.length > 70 ? `${plain.slice(0, 67)}...` : (plain || 'Untitled Blog');
}

function getExcerpt(post) {
  const raw = post.excerpt || post.content || '';
  const plain = raw.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  return plain.length > 150 ? `${plain.slice(0, 147)}...` : plain;
}

app.locals.getTitle = getTitle;
app.locals.getExcerpt = getExcerpt;
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', async (req, res, next) => {
  try {
    const posts = await BlogPosts.find({ deleted: { $ne: true } })
      .sort({ pin: -1, createdAt: -1 })
      .lean();

    res.render('pages/index', {
      posts,
      pageTitle: 'Blogs by Ujwal',
      activePage: 'home'
    });
  } catch (error) {
    next(error);
  }
});

app.get('/blog/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const query = {
      deleted: { $ne: true },
      $or: [
        { alt_id: id }
      ]
    };

    if (mongoose.isValidObjectId(id)) {
      query.$or.push({ _id: id });
    }

    const post = await BlogPosts.findOne(query).lean();

    if (!post) {
      return res.status(404).render('pages/404', {
        pageTitle: 'Blog not found'
      });
    }

    res.render('pages/post', {
      post,
      pageTitle: getTitle(post)
    });

  } catch (error) {
    next(error);
  }
});

app.get('/about', (req, res) => {
  res.render('pages/about', { pageTitle: 'About Ujwal Wadhai' });
});

app.get('/robots.txt', (req, res) => {
  res.type('text/plain').send(`
User-agent: *
Allow: /

Sitemap: https://ujwalwadhai.me/sitemap.xml
`);
});

app.get('/sitemap.xml', async (req, res) => {
  const posts = await BlogPosts.find({ deleted: { $ne: true } })
  const urls = posts.map(post => `
        <url>
            <loc>https://ujwalwadhai.me/blog/${post.alt_id}</loc>
            <lastmod>${post.updatedAt.toISOString()}</lastmod>
        </url>
    `).join('');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        <url>
            <loc>https://ujwalwadhai.me/</loc>
        </url>
        <url>
            <loc>https://ujwalwadhai.me/about</loc>
        </url>
        ${urls}
    </urlset>`;
  res.type('application/xml').send(sitemap);
});

app.use((req, res) => {
  res.status(404).render('pages/404', { pageTitle: 'Page not found' });
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).render('pages/500', { pageTitle: 'Server error' });
});


async function startServer() {
  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI is missing. Add it to your .env file.');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    app.listen(PORT, () => {
      console.log(`Website running\n`);
    });
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
}

startServer();
