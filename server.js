const express = require("express");
const OAuth = require("oauth").OAuth;

const app = express();

// ✅ Use environment variables for security (set in Railway)
const consumerKey = process.env.TWITTER_API_KEY;
const consumerSecret = process.env.TWITTER_API_SECRET;

// Twitter OAuth URLs
const requestTokenURL = "https://api.twitter.com/oauth/request_token";
const accessTokenURL = "https://api.twitter.com/oauth/access_token";
const authorizeURL = "https://api.twitter.com/oauth/authenticate";

// Firebase callback (must match what you added in Twitter Developer Portal)
const callbackURL = "https://brainix-sudoku-test.firebaseapp.com/__/auth/handler";

// Setup OAuth client
const oa = new OAuth(
  requestTokenURL,
  accessTokenURL,
  consumerKey,
  consumerSecret,
  "1.0A",
  callbackURL,
  "HMAC-SHA1"
);

// Endpoint Unity will call to get fresh request_token
app.get("/twitter/request_token", (req, res) => {
  oa.getOAuthRequestToken((error, oauthToken, oauthTokenSecret) => {
    if (error) {
      console.error("❌ Error getting request token:", error);
      return res.status(500).json({ error: "Failed to get request token" });
    }
    res.json({
      oauth_token: oauthToken,
      oauth_token_secret: oauthTokenSecret,
      auth_url: `${authorizeURL}?oauth_token=${oauthToken}`,
    });
  });
});

// Railway will assign the port → fallback to 8080
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
