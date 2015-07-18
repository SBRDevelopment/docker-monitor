# Docker Monitor
Send Docker statistics to logstash. This can be used in combination with a kibana container to view the metrics reported by the container. Requires running an external elasticsearch container.

### Running the container 

You can run the container by linking an elasticsearch container

`sudo docker run -d --name elasticsearch -p 9200:9200 -p 9300:9300 elasticsearch`

`sudo docker run -d --link elasticsearch:elasticsearch --volume /var/run/docker.sock:/var/run/docker.sock docker-monitor`

Or you can run the container by adding the elasticsearch environment variables

`sudo docker run -d --env ELASTICSEARCH_PORT_9200_TCP_ADDR=<es_host> --env ELASTICSEARCH_PORT_9200_TCP_PORT=<es_port> --volume /var/run/docker.sock:/var/run/docker.sock docker-monitor`

If you want to run the container with a different logstash config

`sudo docker run -d --link elasticsearch:elasticsearch --volume /var/run/docker.sock:/var/run/docker.sock --volume <logstash_config>:/usr/src/app/docker-monitor.conf docker-monitor`

### Contents

1. Http Proxy listening on port 9200 as a proxy to a remote elasticsearch service
2. Logstash agent listening on TCP port 9998 for new metrics
3. Docker monitor agent which reads metrics from docker and forwards them to logstash
