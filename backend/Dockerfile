# Backend Dockerfile for Paw & Meow Platform
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package definition files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy application source
COPY . .

# Expose API port
EXPOSE 5000

# Set environment to production
ENV NODE_ENV=production

# Start the Express server
CMD ["node", "server.js"]
