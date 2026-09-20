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

# Application files are owned by the unprivileged `node` user from the base
# image, and the server runs as that user.
COPY --chown=node:node server.js ./
COPY --chown=node:node src ./src
COPY --chown=node:node --from=web-build /app/client/build ./client/build

USER node

EXPOSE 8080

CMD ["npm", "start"]
