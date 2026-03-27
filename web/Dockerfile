FROM node:20-alpine
WORKDIR /app
ENV PORT=3001
ENV NEXT_PUBLIC_API_URL=http://localhost:3000
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN npm install --production=false
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm","run","start","--","-H","0.0.0.0","-p","3001"]
