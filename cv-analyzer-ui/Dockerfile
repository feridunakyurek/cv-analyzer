# Build aşaması: Node.js ile production build al
FROM node:18-alpine AS build

WORKDIR /app

# Önce sadece package.json kopyala → bağımlılıklar cache'den gelir, build hızlanır
COPY package*.json ./

# legacy-peer-deps: TypeScript versiyon uyumsuzluğunu tolere et
RUN npm install --legacy-peer-deps

COPY . .

# Production build al → /app/build klasörü oluşur
RUN npm run build

# Serve aşaması: Node.js gerekmez, Nginx statik dosyaları çok daha hafif sunar
FROM nginx:alpine

# Build çıktısını Nginx'in statik dosya dizinine kopyala
COPY --from=build /app/build /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

# Nginx'i ön planda çalıştır → Docker container ayakta kalsın
CMD ["nginx", "-g", "daemon off;"]