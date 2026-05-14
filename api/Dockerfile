FROM node:22-alpine AS base
WORKDIR /app
RUN apk add --no-cache openssl
COPY package.json tsconfig.json ./
RUN npm install --production=false
COPY scripts ./scripts
COPY prisma ./prisma
RUN node scripts/use-prisma-schema.js postgres && npx prisma generate
COPY src ./src
RUN npm run build; exit 0
COPY entrypoint.sh ./entrypoint.sh
RUN chmod +x entrypoint.sh
EXPOSE 3000
ENTRYPOINT ["./entrypoint.sh"]
