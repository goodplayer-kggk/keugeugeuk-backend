import { SecretManagerServiceClient } from "@google-cloud/secret-manager";

const secretClient = new SecretManagerServiceClient();

export async function initAuth() {
  const [version] = await secretClient.accessSecretVersion({
    name: `projects/${process.env.GCP_PROJECT}/secrets/YOUTUBE_DATA_API_KEY/versions/latest`
  });

  const apiKey = version.payload.data.toString("utf8");

  // YouTube API 키는 바로 사용하는 형태이므로 Firebase 초기화는 생략 가능
  // 단, 필요 시 Firebase Admin SDK 초기화도 여기에 포함 가능
  process.env.YOUTUBE_API_KEY = apiKey;
}