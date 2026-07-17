FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci --legacy-peer-deps

COPY . .

ARG API_BASE_URL
ARG SOCKET_URL

ENV API_BASE_URL=${API_BASE_URL}
ENV REACT_APP_API_BASE_URL=${API_BASE_URL}
ENV SOCKET_URL=${SOCKET_URL}
ENV REACT_APP_SOCKET_URL=${SOCKET_URL}

RUN test -n "$API_BASE_URL" || \
    (echo "API_BASE_URL build argument is required" && exit 1)

RUN npm run build

FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/build /usr/share/nginx/html

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]

