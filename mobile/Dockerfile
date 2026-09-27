# Starts Expo/Metro dev server inside Docker.
# This does not create a native iOS/Android binary.
FROM node:24-bookworm-slim

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 8081 19000 19001 19002

CMD ["npx", "expo", "start", "--host", "0.0.0.0"]
