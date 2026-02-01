FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

# Build Next.js for production
RUN npm run build

# Start production server
CMD ["npm", "start"]
