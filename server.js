const express = require("express");
const OAuth = require("oauth").OAuth;

const app = express();

// ✅ Use Railway environment variables
const consumerKey = process.env.TWITTER_API_KEY || "MISSING_KEY";
const consumerSecret = process.env.TWITTER_API_SECRET || "MISSING_SECRET";

const requestTokenURL = "https://api.twitter.com/oauth/request_token";
const accessTokenURL = "https://api.twitter.com/oauth/access_token";
const authorizeURL = "https://api.twitter.com/oauth/authenticate";

// Your Firebase OAuth redirect
const callbackURL = "https://brainix-sudoku-test.firebaseapp.com/__/auth/handler";

const oa = new OAuth(
  requestTokenURL,
  accessTokenURL,
  consumerKey,
  consumerSecret,
  "1.0A",
  callbackURL,
  "HMAC-SHA1"
);

// ✅ Root route just to confirm server is alive
app.get("/", (req, res) => {
  res.send("🚀 Twitter backend is running on Railway!");
});

// Endpoint Unity will call to get request token
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

// Railway will inject a dynamic PORT (don’t hardcode 8080)
const PORT = process.env.PORT;
if (!PORT) {
  throw new Error("❌ Railway PORT not set!");
}

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
