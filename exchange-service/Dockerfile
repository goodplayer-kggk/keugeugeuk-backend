
#Node.js LTS
FROM node:18

# App directory
WORKDIR /usr/src/app

# Install deps
COPY package*.json ./
RUN npm install --omit=dev

# Copy source
COPY . .

# Expose & start
EXPOSE 8080
CMD ["npm", "start"]

