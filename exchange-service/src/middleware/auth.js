import admin from 'firebase-admin';
import { SecretManagerServiceClient } from "@google-cloud/secret-manager";

let db; // 초기화 후 셋팅
let exchangesCollection;

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
export async function initFirebase() {
  try {
    const serviceAccountStr = await getSecret("GCP_SA_KEY_JSON");
    const serviceAccount = JSON.parse(serviceAccountStr);

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    db = admin.firestore();
    exchangesCollection = db.collection("exchanges");
    console.log("✅ Firebase Admin initialized");
  } catch (err) {
    console.error("❌ Firebase initialization failed:", err.message);
    process.exit(1); // 초기화 실패하면 서버 종료
  }
}

// Firebase Admin SDK를 사용하여 idToken을 검증하는 미들웨어
export const authenticate = async (req, res, next) => {
  const authHeader = req.headers['x-forwarded-authorization'];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
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

export const getExchangesCollection = () => {
  if (!exchangesCollection) {
    throw new Error("Firestore not initialized yet. Call initFirebase first.");
  }
  return exchangesCollection;
};

