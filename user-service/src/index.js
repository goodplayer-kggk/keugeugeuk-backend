import express from "express";
import admin from "firebase-admin";
import cors from "cors";
import { SecretManagerServiceClient } from "@google-cloud/secret-manager";
import { addPointToUser } from './services/userService.js';

const sMServiceClient = new SecretManagerServiceClient();
export async function getSecret(secretName) {
  try {
    const [version] = await sMServiceClient.accessSecretVersion({
      name: `projects/${process.env.GCP_PROJECT}/secrets/${secretName}/versions/latest`,
    });

    const payload = version.payload.data.toString("utf8");
    return payload;
  } catch (err) {
    console.error(`❌ Failed to access secret ${secretName}:`, err.message);
    throw err;
  }
}

// 🔑 Admin SDK 초기화 (Secret Manager에서 키 불러오기)
async function initFirebase() {
  try {
    const serviceAccountStr = await getSecret("GCP_SA_KEY_JSON");
    const serviceAccount = JSON.parse(serviceAccountStr);

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    console.log("✅ Firebase Admin initialized");
  } catch (err) {
    console.error("❌ Firebase initialization failed:", err.message);
    process.exit(1); // 초기화 실패하면 서버 종료
  }
}

const app = express();
app.use(express.json());
app.use(cors());

// Firebase Admin SDK를 사용하여 idToken을 검증하는 미들웨어
const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const idToken = authHeader.split('Bearer ')[1];
  if (!idToken) {
    return res.status(401).json({ message: 'Authorization token is missing' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    res.status(401).json({ message: 'Unauthorized' });
  }
};

// 포인트를 추가하는 API 엔드포인트
app.post('/users/points', authenticate, async (req, res) => {
  const { uid } = req.user;
  const { points } = req.body;

  if (!points || points <= 0) {
    return res.status(400).json({ message: 'Invalid points value' });
  }

  try {
    const user = await addPointToUser(uid, points);
    res.status(200).json({ message: 'Points added successfully', user });
  } catch (error) {
    console.error('Error adding points:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// 서버 시작
const PORT = process.env.PORT || 8080;
initFirebase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});