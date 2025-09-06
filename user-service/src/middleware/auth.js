// src/middleware/auth.js
const admin = require("firebase-admin");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(), // Cloud Run에서는 default 사용 가능
  });
}

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }

  const idToken = authHeader.split("Bearer ")[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken; // 검증된 사용자 정보 attach
    next();
  } catch (err) {
    console.error("JWT verification error:", err);
    return res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
};

module.exports = authenticate;
