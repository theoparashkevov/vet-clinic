# Simple dev image for the API
FROM node:22-alpine AS base
WORKDIR /app
COPY package.json tsconfig.json ./
RUN npm install --production=false
COPY src ./src
RUN npm run build
EXPOSE 3000
CMD ["npm","start"]
