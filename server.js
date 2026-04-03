const express = require("express");
const cors = require("cors");
const path = require("path");
const { exec } = require("child_process");
const fs = require("fs");

const app = express();

app.use(cors());
app.use(express.json());

/* Serve frontend */

app.use(express.static("public"));

/* Ensure downloads folder */

if (!fs.existsSync("downloads")) {
fs.mkdirSync("downloads");
}

/* Fetch Video Info */

app.post("/download", (req, res) => {

const videoUrl = req.body.url;

if (!videoUrl) {
return res.status(400).json({
error: "No URL provided"
});
}

const command =
`yt-dlp -j "${videoUrl}"`;

exec(command, (error, stdout) => {

if (error) {

return res.status(500).json({
error: "Failed to fetch video"
});

}

const info =
JSON.parse(stdout);

res.json({

title: info.title,

qualities: [

{
quality: "🎬 MP4 720p",
url: `/download-video?url=${encodeURIComponent(videoUrl)}&format=mp4`
},

{
quality: "🎵 MP3 Audio",
url: `/download-video?url=${encodeURIComponent(videoUrl)}&format=mp3`
}

]

});

});

});

/* Download Video */

app.get("/download-video", (req, res) => {

const videoUrl = req.query.url;
const format = req.query.format;

if (!videoUrl || !format) {

return res.status(400).send("Missing parameters");

}

const fileName =
Date.now();

let command;

if (format === "mp3") {

command =
`yt-dlp -x --audio-format mp3 -o downloads/${fileName}.mp3 "${videoUrl}"`;

} else {

command =
`yt-dlp -f mp4 -o downloads/${fileName}.mp4 "${videoUrl}"`;

}

exec(command, (error) => {

if (error) {

return res.status(500)
.send("Download failed");

}

const filePath =
path.join(
__dirname,
"downloads",
`${fileName}.${format}`
);

res.download(filePath, () => {

fs.unlinkSync(filePath);

});

});

});

/* Start server */

const PORT =
process.env.PORT || 3000;

app.listen(PORT, () => {

console.log(
`Server running on http://localhost:${PORT}`
);

});
