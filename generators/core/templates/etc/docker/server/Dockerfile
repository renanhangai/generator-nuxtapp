FROM renanhangai/php-node:latest

ENV BUILD_PERMISSION_FILE "/app/local/package.json"
ENV APP_CONFIG "/app/local/etc/docker/config.json"

RUN sudo apt-get install -y --no-install-recommends \
	php7.1-xdebug \
	php7.1-mbstring \
	php7.1-mysql