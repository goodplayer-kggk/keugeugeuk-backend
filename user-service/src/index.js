import express from "express";
import cors from "cors";
import usersRouter from "./routes/users.js";
import { initFirebase } from "./middleware/auth.js"

const app = express();
app.use(express.json());
app.use(cors());

// 포인트를 추가하는 API 엔드포인트
// app.post('/users/points', authenticate, async (req, res) => {
//   const { uid } = req.user;
//   const { points } = req.body;

//   if (!points || points <= 0) {
//     return res.status(400).json({ message: 'Invalid points value' });
//   }

//   try {
//     const user = await addPointToUser(uid, points);
//     res.status(200).json({ message: 'Points added successfully', user });
//   } catch (error) {
//     console.error('Error adding points:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });

// health check
app.get("/", (req, res) => {
  res.send("✅ User Service is running");
});

app.use("/users", usersRouter);

// 서버 시작
const PORT = process.env.PORT || 8080;
initFirebase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});