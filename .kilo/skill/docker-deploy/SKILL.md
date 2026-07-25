---
name: docker-deploy
description: "Docker Compose деплой: Next.js + Strapi + PostgreSQL + Meilisearch + Redis на VPS"
---

# Docker Deploy — Production Setup

## docker-compose.yml

```yaml
version: '3.8'

services:
  # Traefik — reverse proxy + SSL (Let's Encrypt автоматически)
  traefik:
    image: traefik:v3.1
    restart: unless-stopped
    command:
      - "--api.insecure=false"
      - "--providers.docker=true"
      - "--providers.docker.exposedByDefault=false"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--certificatesresolvers.le.acme.email=info@linear-tech.ru"
      - "--certificatesresolvers.le.acme.storage=/letsencrypt/acme.json"
      - "--certificatesresolvers.le.acme.tlschallenge=true"
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - traefik_certs:/letsencrypt
    networks:
      - app

  # Strapi CMS (админка + API)
  strapi:
    image: strapi/strapi:5
    restart: unless-stopped
    environment:
      DATABASE_CLIENT: postgres
      DATABASE_HOST: postgres
      DATABASE_PORT: 5432
      DATABASE_NAME: linear_tech
      DATABASE_USERNAME: strapi
      DATABASE_PASSWORD: ${DB_PASSWORD}
      DATABASE_SSL: 'false'
      JWT_SECRET: ${JWT_SECRET}
      ADMIN_JWT_SECRET: ${ADMIN_JWT_SECRET}
      APP_KEYS: ${APP_KEYS}
      API_TOKEN_SALT: ${API_TOKEN_SALT}
      NODE_ENV: production
    volumes:
      - strapi_uploads:/srv/app/public/uploads
      - ./config:/srv/app/config:ro
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.strapi.rule=Host(`api.linear-tech.ru`)"
      - "traefik.http.routers.strapi.tls.certresolver=le"
    networks:
      - app
    depends_on:
      postgres:
        condition: service_healthy

  # Next.js Frontend
  nextjs:
    build: ./frontend
    restart: unless-stopped
    environment:
      STRAPI_URL: http://strapi:1337
      STRAPI_TOKEN: ${STRAPI_TOKEN}
      MEILISEARCH_HOST: http://meilisearch:7700
      MEILISEARCH_API_KEY: ${MEILI_MASTER_KEY}
      REDIS_URL: redis://redis:6379
      BITRIX24_WEBHOOK: ${BITRIX24_WEBHOOK}
      NEXT_PUBLIC_SITE_URL: https://linear-tech.ru
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.nextjs.rule=Host(`linear-tech.ru`) || Host(`www.linear-tech.ru`)"
      - "traefik.http.routers.nextjs.tls.certresolver=le"
    networks:
      - app
    depends_on:
      - strapi

  # PostgreSQL
  postgres:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_DB: linear_tech
      POSTGRES_USER: strapi
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./db/backups:/backups
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U strapi -d linear_tech"]
      interval: 5s
      timeout: 5s
      retries: 5
    networks:
      - app

  # Meilisearch (быстрый поиск)
  meilisearch:
    image: getmeili/meilisearch:v1.10
    restart: unless-stopped
    environment:
      MEILI_MASTER_KEY: ${MEILI_MASTER_KEY}
      MEILI_ENV: production
    volumes:
      - meili_data:/meili_data
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.meili.rule=Host(`search.linear-tech.ru`)"
    networks:
      - app

  # Redis (кеш)
  redis:
    image: redis:7-alpine
    restart: unless-stopped
    command: redis-server --appendonly yes --maxmemory 256mb --maxmemory-policy allkeys-lru
    volumes:
      - redis_data:/data
    networks:
      - app

volumes:
  postgres_data:
  strapi_uploads:
  traefik_certs:
  meili_data:
  redis_data:

networks:
  app:
    driver: bridge
```

## .env (пример)
```
DB_PASSWORD=<secure-random-password>
JWT_SECRET=<secure-random-token>
ADMIN_JWT_SECRET=<secure-random-token>
APP_KEYS=<random,random,random,random>
API_TOKEN_SALT=<secure-random-salt>
STRAPI_TOKEN=<strapi-api-token>
MEILI_MASTER_KEY=<secure-random-key>
BITRIX24_WEBHOOK=https://linear.bitrix24.ru/rest/1/xxxxx/
```

## Dockerfile для Next.js (frontend/Dockerfile)
```dockerfile
# frontend/Dockerfile
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --only=production

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
```

## GitHub Actions CI/CD (.github/workflows/deploy.yml)
```yaml
name: Deploy to VPS
on:
  push:
    branches: [master]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd /opt/linear-tech
            git pull origin master
            docker compose up -d --build nextjs
            docker compose exec strapi npm run build  # rebuild Strapi admin if needed
```

## Бэкапы (cron на VPS)
```bash
# /etc/cron.d/linear-tech-backup
# Ежедневно в 2:00
0 2 * * * root docker exec linear-tech-postgres-1 pg_dump -U strapi linear_tech > /opt/linear-tech/db/backups/$(date +\%Y\%m\%d).sql
# Каждое воскресенье в 3:00 — tar uploads
0 3 * * 0 root tar -czf /opt/backups/uploads-$(date +\%Y\%m\%d).tar.gz /opt/linear-tech/strapi-uploads/
# Хранить последние 30 дней
0 4 * * * root find /opt/linear-tech/db/backups/ -mtime +30 -delete
```

## Проверка статуса всех сервисов
```bash
# docker compose ps
NAME                  STATUS
linear-tech-traefik-1    running
linear-tech-strapi-1     running
linear-tech-nextjs-1     running
linear-tech-postgres-1    running (healthy)
linear-tech-meilisearch-1 running
linear-tech-redis-1      running
```
