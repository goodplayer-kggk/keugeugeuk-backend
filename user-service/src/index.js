import express from "express";
import bodyParser from "body-parser";
import { Firestore } from "@google-cloud/firestore";

const app = express();
const port = process.env.PORT || 8080;

// Firestore 초기화
const db = new Firestore({
  projectId: process.env.GCP_PROJECT || "keugeugeuk-backend",
});

app.use(bodyParser.json());

// 헬스체크용
app.get("/", (req, res) => {
  res.send({ status: "ok", service: "user-service" });
});

// 모든 유저 조회
app.get("/users", async (req, res) => {
  try {
    const usersSnapshot = await db.collection("users").get();
    if (usersSnapshot.empty) {
      throw new Error("Firestore: No users found");
    }

    const users = [];
    usersSnapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() });
    });

    res.json(users);
  } catch (err) {
    console.error("Firestore error:", err.message);

    // 테스트 데이터 반환 (DB 실패 시 fallback)
    res.json([
      { id: "1", nickname: "테스트 유저 A", points: 100 },
      { id: "2", nickname: "테스트 유저 B", points: 200 },
    ]);
  }
});

// 유저 등록 (소셜 로그인 토큰 포함)
app.post("/users", async (req, res) => {
  try {
    const { uid, nickname, provider, token, points } = req.body;
    await db.collection("users").doc(uid).set({
      uid,
      nickname,
      provider,
      token,
      points: points || 0,
      createdAt: new Date().toISOString(),
    });
    res.status(201).json({ message: "User created" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 특정 유저 조회
app.get("/users/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const userRef = db.collection("users").doc(id);
    const doc = await userRef.get();

    if (!doc.exists) {
      throw new Error("Firestore: User not found");
    }

    res.json({ id: doc.id, ...doc.data() });
  } catch (err) {
    console.error("Firestore error:", err.message);

    // 테스트 데이터 fallback
    res.json({ id, nickname: `테스트 유저 ${id}`, points: 999 });
  }
});

app.listen(port, () => {
  console.log(`User service listening on port ${port}`);
});

