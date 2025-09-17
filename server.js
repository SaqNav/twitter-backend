const express = require("express");
const OAuth = require("oauth").OAuth;
const admin = require("firebase-admin");

const app = express();

// ✅ Railway env vars
const consumerKey = process.env.TWITTER_API_KEY;
const consumerSecret = process.env.TWITTER_API_SECRET;

// Twitter OAuth endpoints
const requestTokenURL = "https://api.twitter.com/oauth/request_token";
const accessTokenURL = "https://api.twitter.com/oauth/access_token";
const authorizeURL = "https://api.twitter.com/oauth/authenticate";

// 🔹 New callback URL → must be added in Twitter Developer Portal
const callbackURL = "https://twitter-backend-production-d63a.up.railway.app/twitter/callback";

// ✅ Setup Firebase Admin (load service account JSON from Railway variable FIREBASE_CONFIG)
if (process.env.FIREBASE_CONFIG) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG);

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    console.log("✅ Firebase Admin initialized with FIREBASE_CONFIG");
  } catch (e) {
    console.error("❌ Failed to parse FIREBASE_CONFIG:", e);
  }
} else {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });

  console.log("✅ Firebase Admin initialized with applicationDefault()");
}

// Setup Twitter OAuth client
const oa = new OAuth(
  requestTokenURL,
  accessTokenURL,
  consumerKey,
  consumerSecret,
  "1.0A",
  callbackURL,
  "HMAC-SHA1"
);

// ✅ Root health check
app.get("/", (req, res) => {
  res.send("🚀 Twitter backend with Firebase Custom Token is running!");
});

// Step 1: Unity requests Twitter auth URL
app.get("/twitter/request_token", (req, res) => {
  oa.getOAuthRequestToken((error, oauthToken, oauthTokenSecret) => {
    if (error) {
      console.error("❌ Error getting request token:", error);
      return res.status(500).json({ error: "Failed to get request token" });
    }
    res.json({
      auth_url: `${authorizeURL}?oauth_token=${oauthToken}`
    });
  });
});

// Step 2: Twitter redirects here after user logs in
app.get("/twitter/callback", (req, res) => {
  const { oauth_token, oauth_verifier } = req.query;

  oa.getOAuthAccessToken(
    oauth_token,
    null,
    oauth_verifier,
    async (err, accessToken, accessTokenSecret, results) => {
      if (err) {
        console.error("❌ Error exchanging token:", err);
        return res.status(500).send("Twitter auth failed");
      }

      try {
        // Use Twitter user_id as Firebase UID
        const uid = `twitter:${results.user_id}`;

        // Mint a Firebase custom token
        const firebaseToken = await admin.auth().createCustomToken(uid);

        // ✅ Redirect to Unity app (deep link)
        const redirectUrl = `mygame://auth?token=${firebaseToken}`;
        res.redirect(redirectUrl);
      } catch (e) {
        console.error("❌ Firebase token creation failed:", e);
        res.status(500).send("Firebase auth failed");
      }
    }
  );
});

// ✅ Use Railway port
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));