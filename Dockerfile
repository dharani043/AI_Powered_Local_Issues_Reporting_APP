FROM node:18-alpine

WORKDIR /app

# Copy server files
COPY server/package*.json ./

# Install dependencies
RUN npm install --production

# Copy all server source code
COPY server/ ./

# Expose port
EXPOSE 5000

ENV PORT=5000

# Start the server
CMD ["node", "server.js"]