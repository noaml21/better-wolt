# Builds the React web client, then runs the Node/Express API server.
# The Express server also serves client/build for the web application.

FROM node:24-bookworm-slim AS web-build
WORKDIR /app/client

COPY client/package*.json ./
RUN npm ci

COPY client/ ./
RUN npm run build


FROM node:24-bookworm-slim AS backend
WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY server.js ./
COPY src ./src
COPY --from=web-build /app/client/build ./client/build

EXPOSE 8080

CMD ["npm", "start"]
