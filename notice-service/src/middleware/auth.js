import { initializeApp, applicationDefault } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import admin from "firebase-admin";
import { SecretManagerServiceClient } from "@google-cloud/secret-manager";

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

const serviceAccountStr = await getSecret("GCP_SA_KEY_JSON");
const serviceAccount = JSON.parse(serviceAccountStr);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = getFirestore();
export default db;