FROM node:alpine AS builder

WORKDIR /app
COPY . /app
RUN npm install && npm run build

FROM nginx:stable-alpine

COPY --from=builder /app/build /usr/share/nginx/html
COPY deployment/nginx.conf /etc/nginx/conf.d/default.conf
COPY deployment/entrypoint.sh /

EXPOSE 80

CMD ["/entrypoint.sh"]
