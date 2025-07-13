const { fetchRecentItems } = require('./src/database/queries')
const { embedItem } = require('./src/patterns/semantic')
require('dotenv').config()

const { query } = require('./config/database');

(async () => {
  const { rows } = await query(`
    SELECT id, title, body, created_utc
    FROM reddit_items
    WHERE subreddit = 'psychology'
      AND created_utc > NOW() - INTERVAL '5 minutes'
    ORDER BY created_utc DESC;
  `);

  console.log(`Pulled ${rows.length} rows from r/psychology`);
  rows.forEach(r => {
    console.log(`${r.id}: ${r.title?.slice(0, 50) || r.body?.slice(0, 50)} (${r.created_utc})`);
  });
})();

