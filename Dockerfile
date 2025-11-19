# Stage 1: Base image for development
FROM node:latest AS base

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy the entire project into the container
COPY . .

# Build Typescript
RUN npx tsc

# Set the working directory inside the container
WORKDIR /usr/src/app/dist

# Expose the application port
EXPOSE 3000

# Command to run the compiled server
CMD ["node", "index.js"]
