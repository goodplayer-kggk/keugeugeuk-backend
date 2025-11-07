import { initializeApp, applicationDefault } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import admin from "firebase-admin";

admin.initializeApp({
  credential: applicationDefault(),
});

const db = getFirestore();
export default db;