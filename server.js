import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { exec } from "child_process";
import path from "path";
import fs from "fs";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

app.post("/download", async (req, res) => {
  const { url } = req.body;

  if (!url) return res.status(400).json({ error: "URL required" });

  try {
    // Get video info
    exec(
      `yt-dlp -j "${url}"`,
      (err, stdout) => {
        if (err || !stdout) {
          return res.status(500).json({ error: "Failed to fetch video info" });
        }

        const info = JSON.parse(stdout);

        // Filter MP4 and MP3 formats
        const qualities = info.formats
          .filter(f => f.ext === "mp4" || f.ext === "m4a" || f.ext === "webm")
          .map(f => ({
            quality: `${f.format_note || f.format_id} (${f.ext})`,
            url: f.url
          }));

        res.json({ title: info.title, qualities });
      }
    );
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
