FROM nginx:alpine
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
CMD ["/bin/sh", "-c", "envsubst '${NGINX_FRONTEND_SERVER_NAME} ${NGINX_API_SERVER_NAME} ${NGINX_FRONTEND_UPSTREAM} ${NGINX_BACKEND_UPSTREAM} ${NGINX_CLIENT_MAX_BODY_SIZE}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]