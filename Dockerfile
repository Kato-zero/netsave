FROM node:22

# Install yt-dlp and ffmpeg
RUN apt-get update && \
    apt-get install -y ffmpeg python3-pip && \
    pip3 install yt-dlp && \
    apt-get clean

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
