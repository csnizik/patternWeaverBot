CREATE TABLE IF NOT EXISTS reddit_items (
  id TEXT PRIMARY KEY,
  type TEXT CHECK (type IN ('post', 'comment')),
  subreddit TEXT,
  author TEXT,
  created_utc TIMESTAMPTZ,
  title TEXT,
  body TEXT,
  permalink TEXT
);
