import express from "express";
import cors from "cors";
import noticeRouter from "./routes/notice.js";

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// 라우트 등록 (ID: 20251010-03)
app.use("/notices", noticeRouter);

app.listen(PORT, () => {
  console.log(`✅ notice-service listening on port ${PORT}`);
});
