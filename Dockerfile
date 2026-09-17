# ---- Build stage ----
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Variables de entorno de Vite: se "queman" en el bundle en build time.
ARG VITE_USE_MOCK=false
ARG VITE_API_URL=http://localhost:4000/api/v1
ENV VITE_USE_MOCK=$VITE_USE_MOCK
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# ---- Runtime stage (nginx sirviendo el build estatico) ----
FROM nginx:1.27-alpine AS runtime
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
