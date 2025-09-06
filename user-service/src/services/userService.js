// src/services/userService.js
const admin = require("firebase-admin");
const db = admin.firestore();

const getUsers = async () => {
  const usersSnapshot = await db.collection("users").get();
  const users = [];
  usersSnapshot.forEach((doc) => users.push(doc.data()));
  return users;
};

const getUserById = async (id) => {
  const doc = await db.collection("users").doc(id).get();
  if (!doc.exists) return null;
  return doc.data();
};

const createOrUpdateUser = async (userId, userData) => {
  await db.collection("users").doc(userId).set(userData, { merge: true });
  return userData;
};

module.exports = { getUsers, getUserById, createOrUpdateUser };
