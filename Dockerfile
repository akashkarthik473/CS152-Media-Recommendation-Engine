FROM node:24-slim

WORKDIR /app

# Copy package files
COPY RecFinder/package*.json ./

# Install dependencies
RUN npm install

EXPOSE 5173

# Don't specify CMD here - it will be overridden by docker-compose command
