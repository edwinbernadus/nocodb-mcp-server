FROM node:18-slim

WORKDIR /app

# Copy application code
COPY . .

## Install dependencies
RUN npm install

# Build the application
RUN npm run build

# Command will be provided by smithery.yaml
CMD ["node", "dist/start.js"]
