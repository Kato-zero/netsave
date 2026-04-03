const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = 3000;

const downloadPath =
path.join(__dirname, "downloads");

if (!fs.existsSync(downloadPath)) {

fs.mkdirSync(downloadPath);

}

app.use(
"/downloads",
express.static(downloadPath)
);

app.use(
express.static(
path.join(__dirname, "public")
)
);

/* Extract Video Info */

app.post("/download", async (req, res) => {

const { url } = req.body;

if (!url) {

return res
.status(400)
.json({ error: "No URL" });

}

try {

const cmd =
`yt-dlp -J "${url}"`;

exec(cmd, (err, stdout) => {

if (err) {

return res
.status(500)
.json({
error:
"Failed to fetch video info"
});

}

const data =
JSON.parse(stdout);

const title =
data.title.replace(
/[^a-z0-9]/gi,
"_"
);

res.json({

title,

qualities: [

{
quality: "MP4 720p",
url:
`/download-video?url=${encodeURIComponent(url)}&format=mp4`
},

{
quality: "MP4 1080p",
url:
`/download-video?url=${encodeURIComponent(url)}&format=mp4-hd`
},

{
quality: "MP3 Audio",
url:
`/download-video?url=${encodeURIComponent(url)}&format=mp3`
}

]

});

});

}

catch {

res
.status(500)
.json({
error: "Server error"
});

}

});

/* Download Route */

app.get(
"/download-video",
(req, res) => {

const { url, format } = req.query;

if (!url) {

return res
.status(400)
.send("Missing URL");

}

const fileName =
Date.now();

let cmd;

if (format === "mp3") {

cmd =
`yt-dlp -x --audio-format mp3 -o "${downloadPath}/${fileName}.mp3" "${url}"`;

}

else if (
format === "mp4-hd"
) {

cmd =
`yt-dlp -f "bestvideo[height<=1080]+bestaudio/best[height<=1080]" -o "${downloadPath}/${fileName}.mp4" "${url}"`;

}

else {

cmd =
`yt-dlp -f "best[height<=720]" -o "${downloadPath}/${fileName}.mp4" "${url}"`;

}

exec(cmd, (err) => {

if (err) {

return res
.status(500)
.send(
"Download failed"
);

}

const filePath =
path.join(
downloadPath,
`${fileName}.${format === "mp3" ? "mp3" : "mp4"}`
);

res.download(filePath);

});

}
);

app.listen(PORT, () => {

console.log(
`🚀 Server running on http://localhost:${PORT}`
);

});
