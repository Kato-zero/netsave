FROM node:18

# Install yt-dlp + ffmpeg

RUN apt-get update && \
apt-get install -y yt-dlp ffmpeg

WORKDIR /app

COPY . .

RUN npm install

EXPOSE 3000

CMD ["node", "server.js"]
