// src/services/userService.js


export const getUsers = async (db) => {
  const usersSnapshot = await db.collection("users").get();
  const users = [];
  usersSnapshot.forEach((doc) => users.push(doc.data()));
  return users;
};

export const getUserById = async (db, id) => {
  const doc = await db.collection("users").doc(id).get();
  if (!doc.exists) return null;
  return doc.data();
};

export const createOrUpdateUser = async (db, userId, userData) => {
  await db.collection("users").doc(userId).set(userData, { merge: true });
  return userData;
};