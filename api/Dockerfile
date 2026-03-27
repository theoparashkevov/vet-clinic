# Simple dev image for the API
FROM node:22-alpine AS base
WORKDIR /app
RUN apk add --no-cache openssl
COPY package.json tsconfig.json ./
RUN npm install --production=false
COPY scripts ./scripts
COPY prisma ./prisma
RUN npm run prisma:use:postgres && npm run prisma:generate
COPY src ./src
RUN npm run build
EXPOSE 3000
CMD ["npm","start"]
