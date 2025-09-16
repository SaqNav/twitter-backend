const express = require("express");
const OAuth = require("oauth").OAuth;

const app = express();

const consumerKey = "BYZrJtC3a53FECsliN1ltrfjv";        // From Twitter Developer Portal
const consumerSecret = "AP7pTwvjGhpFDOzqJsQrUbOH3vr6SvbsrmxMEMVgS7uxfJ53GP";  // Keep secret!

const requestTokenURL = "https://api.x.com/oauth/request_token";
const accessTokenURL = "https://api.x.com/oauth/access_token";
const authorizeURL = "https://api.x.com/oauth/authenticate";

const callbackURL = "https://brainix-sudoku-test.firebaseapp.com/__/auth/handler"; // Firebase OAuth handler

const oa = new OAuth(
  requestTokenURL,
  accessTokenURL,
  consumerKey,
  consumerSecret,
  "1.0A",
  callbackURL,
  "HMAC-SHA1"
);

// Unity calls this to get a fresh request token
app.get("/twitter/request_token", (req, res) => {
  oa.getOAuthRequestToken((error, oauthToken, oauthTokenSecret, results) => {
    if (error) {
      console.error("Error getting request token:", error);
      return res.status(500).json({ error: "Failed to get request token" });
    }
    res.json({
      oauth_token: oauthToken,
      oauth_token_secret: oauthTokenSecret,
      auth_url: `${authorizeURL}?oauth_token=${oauthToken}`,
    });
  });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
