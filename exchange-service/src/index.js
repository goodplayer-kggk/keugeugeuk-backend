import express from "express";
import cors from "cors";
import usersRouter from "./routes/users.js";
import { initFirebase } from "./middleware/auth.js"

const app = express();
app.use(express.json());
app.use(cors());

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