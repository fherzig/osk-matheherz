FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package.json .
RUN npm install --production

# Copy app files
COPY server.js .
COPY public/ ./public/

# Create data directory for SQLite
RUN mkdir -p /data

EXPOSE 3000

CMD ["node", "server.js"]
