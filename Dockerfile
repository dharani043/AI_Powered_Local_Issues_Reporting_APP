FROM node:18-alpine

WORKDIR /app

# Copy server package files
COPY server/package*.json ./server/

# Install dependencies
RUN cd server && npm install --production

# Copy server source code
COPY server/ ./server/

# Expose port
EXPOSE 5000

# Start the server
CMD ["node", "server/server.js"]