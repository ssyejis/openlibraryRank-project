const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
const PORT = 5001;

const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3000', 'https://ssyejis.github.io'];
const corsOptions = {
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  }
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.get('/api/projects', async (req, res) => {
  try {
    const rawQ = req.query.q;
    const rawTags = req.query.tags;

    let q;
    if (rawTags) {
      const tagList = String(rawTags).split(',').map(t => t.trim()).filter(Boolean);
      q = tagList.join(' ');
    } else {
      q = (typeof rawQ === 'undefined' || String(rawQ).trim() === '') ? 'stars:>0' : rawQ;
    }
    const per_page = 10;
    const page = parseInt(req.query.page) || 1;
    const all = req.query.all === 'true' || req.query.all === '1';

    const headers = {};
    if (process.env.GITHUB_TOKEN) {
      headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
    }

    const githubUrl = (p) => `https://api.github.com/search/repositories?q=${encodeURIComponent(q)}&per_page=${per_page}&page=${p}&sort=stars&order=desc`;

    if (all) {
      const maxPages = 5;
      const results = [];
      for (let p = 1; p <= maxPages; p++) {
        const resp = await axios.get(githubUrl(p), { headers });
        if (resp.data && resp.data.items) {
          results.push(...resp.data.items);
          if (resp.data.items.length < per_page) break;
        } else break;
      }
      const uniq = [];
      const seen = new Set();
      for (const r of results) {
        if (!seen.has(r.full_name)) {
          seen.add(r.full_name);
          uniq.push(r);
        }
      }
      uniq.sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0));
      return res.json({ items: uniq, total_count: uniq.length });
    }

    const resp = await axios.get(githubUrl(page), { headers });
    const items = (resp.data && resp.data.items) ? resp.data.items : [];
    items.sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0));
    const total = (resp.data && typeof resp.data.total_count === 'number') ? resp.data.total_count : items.length;
    res.json({ items, total_count: total });
  } catch (err) {
    console.error('Error in /api/projects:', err && err.stack ? err.stack : err);
    if (err && err.response) {
      const status = err.response.status || 500;
      const details = err.response.data || err.message;
      if (status === 401 || status === 403) {
        const hintMsg = (typeof details === 'object' && details.message) ? details.message : String(details);
        const userHint = `GitHub API returned ${status}: ${hintMsg}. This commonly means you hit the unauthenticated rate limit or need to provide a token. Set GITHUB_TOKEN (a Personal Access Token) in the environment and restart the server to raise rate limits.`;
        return res.status(status).json({ error: err.message, details: userHint });
      }
      return res.status(status).json({ error: err.message, details });
    }
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});