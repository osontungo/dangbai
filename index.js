const fetch = require('node-fetch');
const fs = require('fs');
const cron = require('node-cron');

const TWITTER_BEARER = process.env.TWITTER_BEARER;
const TWITTER_USER_ID = process.env.TWITTER_USER_ID;
const FOCUS_API_URL = process.env.FOCUS_API_URL;
const FOCUS_API_TOKEN = process.env.FOCUS_API_TOKEN;

let postedIds = new Set();
if (fs.existsSync('posted.json')) {
  postedIds = new Set(JSON.parse(fs.readFileSync('posted.json')));
}

async function getLatestTweets() {
  const url = `https://api.twitter.com/2/users/${TWITTER_USER_ID}/tweets?max_results=5`;
  const res = await fetch(url, {
    headers: { 'Authorization': TWITTER_BEARER }
  });
  const data = await res.json();
  return data.data || [];
}

async function postToFocus(tweet) {
  const payload = {
    content: tweet.text,
    timestamp: Date.now(),
    from: "auto-tweet-sync"
  };

  await fetch(FOCUS_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + FOCUS_API_TOKEN
    },
    body: JSON.stringify(payload)
  });
}

async function syncTweets() {
  console.log(`[${new Date().toLocaleTimeString()}] Checking tweets...`);
  const tweets = await getLatestTweets();
  for (const tweet of tweets.reverse()) {
    if (!postedIds.has(tweet.id)) {
      await postToFocus(tweet);
      console.log(`=> Posted: ${tweet.text}`);
      postedIds.add(tweet.id);
      fs.writeFileSync('posted.json', JSON.stringify([...postedIds]));
    }
  }
}

cron.schedule('*/10 * * * *', () => {
  syncTweets().catch(console.error);
});

syncTweets();
