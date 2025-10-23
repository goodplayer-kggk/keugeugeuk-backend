import express from "express";
import cors from "cors";
import lifetipsRouter from "./routes/lifetips.js";
import { initAuth } from "./middleware/auth.js";

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// 인증 미들웨어 초기화 (ID: 20251010-02)
await initAuth();

// 라우트 등록 (ID: 20251010-03)
app.use("/lifetips", lifetipsRouter);

app.listen(PORT, () => {
  console.log(`✅ lifetips-service listening on port ${PORT}`);
});