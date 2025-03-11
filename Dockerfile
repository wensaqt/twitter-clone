FROM node:18.17.0

WORKDIR /app

# Copy package.json and package-lock.json first
COPY package*.json ./

# Install dependencies inside the container
RUN npm install

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
