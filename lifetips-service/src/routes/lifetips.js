import express from "express";
import fetch from "node-fetch";

const router = express.Router();

router.get("/", async (req, res) => {
  const query = req.query.q;
  if (!query) return res.status(400).json({ error: "Query required" });

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=5&q=${encodeURIComponent(query)}&key=${process.env.YOUTUBE_API_KEY}`
    );
    const data = await response.json();

    // 필요한 데이터만 정리
    const tips = data.items.map(item => ({
      title: item.snippet.title,
      thumbnailUrl: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url || "https://via.placeholder.com/320x180?text=No+Image", // ✅ fallback 추가
      videoUrl: `https://youtu.be/${item.id.videoId}`, // video url
      channel: item.snippet.channelTitle
    }));

    res.status(200).json(tips);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch lifetips" });
  }
});

export default router;