import admin from 'firebase-admin';
import express from 'express';
import { authenticate } from '../middleware/auth.js'
import { getUsersCollection } from '../middleware/auth.js'

const router = express.Router();

// ✅ 회원 생성
router.post("/", authenticate, async (req, res) => {
  try {
    const { uid, email, phoneNumber, provider } = req.body;

    if (!uid) {
      return res.status(400).json({ error: "uid is required" });
    }

    // Firestore에 저장
    const usersCollection = getUsersCollection();
    const userDoc = getUsersCollection().doc(uid)
    const doc = await userDoc.get()
    if (!doc.exists) {
      await userDoc.set({
        uid,
        email: email || null,
        phoneNumber: phoneNumber || null,
        provider: provider || "kggk user",
        points: 0,
        history: [],
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      console.log(`User(${uid}) data was created`);
    } else {
      // 기존 유저 → 필요한 정보만 업데이트
      await userDoc.set({
        provider: provider || "kggk user",
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
      console.log(`User(${uid}) already exists and updated provider`);
    }

    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Failed to create user" });
  }
});


// ✅ 회원 조회
router.get("/:uid", authenticate, async (req, res) => {
  try {
    const { uid } = req.params;

    // 토큰의 uid와 요청한 uid 비교 → 다른 유저 정보 못 보게 막음
    if (req.user.uid !== uid) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const usersCollection = getUsersCollection();
    const doc = await usersCollection.doc(uid).get();

    if (!doc.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(doc.data());
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// ✅ 포인트 추가
router.post("/:uid/points", authenticate, async (req, res) => {
  try {
    const { uid } = req.params;
    const { points } = req.body;

    if (req.user.uid !== uid) {
      return res.status(403).json({ error: "Forbidden" });
    }

    if (typeof points !== "number") {
      return res.status(400).json({ error: "points must be a number" });
    }

    const usersCollection = getUsersCollection();
    const userRef = usersCollection.doc(uid);

    await userRef.update({
      points: admin.firestore.FieldValue.increment(points),
      history: admin.firestore.FieldValue.arrayUnion({
        type: "POINT_ADD",
        amount: points,
        date: new Date().toISOString(),
      }),
    });

    res.json({ message: "Points added successfully" });
  } catch (error) {
    console.error("Error adding points:", error);
    res.status(500).json({ error: "Failed to add points" });
  }
});

export default router;