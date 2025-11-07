import express from "express";
import fetch from "node-fetch";
import db from "../middleware/auth.js";
import { Timestamp } from "firebase-admin/firestore";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const snapshot = await db
              .collection("notices")
              .orderBy("isImportant", "desc")
              .orderBy("date", "desc")
              .get();
    const notices = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(notices);
  } catch (error) {
    console.error("🔥 Server Error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const doc = await db.collection("notices").doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: "Notice not found" });
    res.status(200).json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error("🔥 Server Error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { title, content, isImportant } = req.body;
    if (!title || !content || typeof title !== "string" || typeof content !== "string") {
      return res.status(400).json({ error: "Invalid title or content" });
    }
    const newNotice = { title, content, isImportant, date: Timestamp.now() };
    const docRef = await db.collection("notices").add(newNotice);
    res.status(201).json({ id: docRef.id, ...newNotice });
  } catch (error) {
    console.error("🔥 Server Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { title, content, isImportant } = req.body;
    const ref = db.collection("notices").doc(req.params.id);
    await ref.update({ title, content, isImportant, date: new Date() });
    res.status(200).json({ id: req.params.id, title, content, isImportant });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update notice" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await db.collection("notices").doc(req.params.id).delete();
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete notice" });
  }
});

export default router;