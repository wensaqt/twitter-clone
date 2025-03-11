# Use the official Node.js image as the base image
FROM node:18.17.0

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json from the base of the project
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application code from the base of the project
COPY . .

# Build the Next.js application
#RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["npm", "run", "dev"]