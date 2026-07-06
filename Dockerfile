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
# VITE_REDUX_PERSIST_ENCRYPTION_KEY não é segredo protegível por build-arg: o Vite injeta seu valor
# literal no bundle JS enviado ao browser (import.meta.env em build time), então já é público
# independente de como chega até aqui — só ofusca leitura casual do localStorage, não é boundary de segurança.
ARG VITE_API_URL
ARG VITE_REDUX_PERSIST_ENCRYPTION_KEY
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_REDUX_PERSIST_ENCRYPTION_KEY=$VITE_REDUX_PERSIST_ENCRYPTION_KEY
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
