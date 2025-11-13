# Use official Node.js 20 slim image
FROM node:20-slim

# Create app directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install only production dependencies
RUN npm install --production

# Copy source code
COPY . .

# Expose the port Cloud Run expects
ENV PORT 8080
EXPOSE 8080

# Start the server
CMD ["npm", "start"]
