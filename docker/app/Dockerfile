# Build a minimal Docker image for the app
FROM node:24-alpine
WORKDIR /app
COPY index.js .
RUN npm install aws-sdk
CMD ["node", "index.js"]