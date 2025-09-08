const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
const { addPointToUser } = require('./services/userService');

admin.initializeApp();

const app = express();
app.use(express.json());
app.use(cors());

// Firebase Admin SDK를 사용하여 idToken을 검증하는 미들웨어
const authenticate = async (req, res, next) => {
  const idToken = req.headers.authorization?.split('Bearer ')[1];
  if (!idToken) {
    return res.status(401).json({ message: 'Authorization token is missing' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    res.status(401).json({ message: 'Unauthorized' });
  }
};

// 포인트를 추가하는 API 엔드포인트
app.post('/users/points', authenticate, async (req, res) => {
  const { uid } = req.user;
  const { points } = req.body;

  if (!points || points <= 0) {
    return res.status(400).json({ message: 'Invalid points value' });
  }

  try {
    const user = await addPointToUser(uid, points);
    res.status(200).json({ message: 'Points added successfully', user });
  } catch (error) {
    console.error('Error adding points:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// 서버 시작
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});