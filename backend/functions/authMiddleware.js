const admin = require("./firebaseAdmin");

async function verifyFirebaseRequest(req, res, next) {
  try {
    const header = req.get("authorization") || "";
    const match = header.match(/^Bearer\s+(.+)$/i);

    if (!match) {
      return res.status(401).json({ error: "Missing Firebase ID token." });
    }

    const decodedToken = await admin.auth().verifyIdToken(match[1], true);
    req.firebaseUser = decodedToken;
    return next();
  } catch (error) {
    console.warn("[OD Auth] Firebase token verification failed:", error.code || error.message);
    return res.status(401).json({ error: "Invalid or expired authentication token." });
  }
}

module.exports = { verifyFirebaseRequest };
