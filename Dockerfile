FROM sbrnetmarketing/node-openjdk:0.10.40
MAINTAINER Brian Wight "bwight@sbrforum.com"

RUN echo 'deb http://packages.elasticsearch.org/logstash/1.5/debian stable main' | tee /etc/apt/sources.list.d/logstash.list
RUN apt-get update && apt-get install -y --force-yes logstash

RUN mkdir -p /var/log/http-proxy
RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY package.json /usr/src/app/
RUN npm install
COPY . /usr/src/app

COPY docker-monitor.conf /etc/logstash/conf.d/docker-monitor.conf

CMD ./entrypoint start