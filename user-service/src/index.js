// src/index.js
import express from "express";
import bodyParser from "body-parser";
import jwt from "jsonwebtoken";
import admin from "firebase-admin";
import * as userService from "./services/userService.js";

const app = express();
const port = process.env.PORT || 8080;

// Firebase Admin 초기화
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}
const db = admin.firestore();

app.use(bodyParser.json());

// 헬스체크
app.get("/", (req, res) => {
  res.send({ status: "ok", service: "user-service" });
});

// 모든 유저 조회
app.get("/users", async (req, res) => {
  try {
    const users = await userService.getUsers(db);
    res.json(users);
  } catch (err) {
    console.error("Firestore error:", err.message);
    res.json([
      { id: "1", nickname: "테스트 유저 A", points: 100 },
      { id: "2", nickname: "테스트 유저 B", points: 200 },
    ]);
  }
});

// 특정 유저 조회
app.get("/users/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const user = await userService.getUserById(db, id);
    if (!user) throw new Error("User not found");
    res.json({ id, ...user });
  } catch (err) {
    console.error("Firestore error:", err.message);
    res.json({ id, nickname: `테스트 유저 ${id}`, points: 999 });
  }
});

// 유저 등록 / 수정 & JWT 발급
app.post("/users", async (req, res) => {
  try {
    const { uid, nickname, provider, token, points } = req.body;

    const userData = {
      uid,
      nickname,
      provider,
      token,
      points: points || 0,
      createdAt: new Date().toISOString(),
    };

    await userService.createOrUpdateUser(db, uid, userData);

    // JWT 발급
    const jwtToken = jwt.sign({ uid, nickname }, process.env.JWT_SECRET || "secret", {
      expiresIn: "1h",
    });

    res.status(201).json({ message: "User created/updated", token: jwtToken });
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`User service listening on port ${port}`);
});