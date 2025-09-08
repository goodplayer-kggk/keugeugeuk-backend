import admin from 'firebase-admin';

// 사용자에게 포인트를 추가하는 함수
const addPointToUser = async (uid, points) => {
  const userRef = db.collection('users').doc(uid);
  const userDoc = await userRef.get();
  const db = admin.firestore();

  if (!userDoc.exists) {
    // 사용자가 없으면 새로 생성
    await userRef.set({
      uid,
      points,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  } else {
    // 기존 사용자에게 포인트 추가
    await userRef.update({
      points: admin.firestore.FieldValue.increment(points),
    });
  }

  return { uid, points };
};
export { addPointToUser };