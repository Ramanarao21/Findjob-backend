# Use official Node.js lightweight Alpine image
FROM node:20-alpine AS base

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Bundle app source
COPY . .

# Expose server port
EXPOSE 5000

# Set environment to production
ENV NODE_ENV=production

# Health check instruction
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/ || exit 1

# Command to run application
CMD ["node", "src/server.js"]
