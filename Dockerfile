# ---- Estágio: development ----
FROM node:24-alpine AS development
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 4000
CMD ["npm", "run", "dev", "--", "--host"]

# ---- Estágio: build ----
FROM node:24-alpine AS build
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---- Estágio: production ----
# nginxinc/nginx-unprivileged: master e workers rodam como usuário nginx (uid 101), não root; escuta 8080 (porta < 1024 exige root)
FROM nginxinc/nginx-unprivileged:1.29-alpine AS production
COPY --from=build /usr/src/app/dist /usr/share/nginx/html
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
