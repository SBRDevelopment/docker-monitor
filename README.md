# docker-monitor
Send Docker statistics to logstash

You can run the container by linking an elasticsearch container
`sudo dockerun -d --link elasticsearch:elasticsearch --volume /var/run/docker.sock:/var/run/docker.sock docker-monitor`

Or you can run the container by adding the elasticsearch environment variables
`sudo dockerun -d --env ELASTICSEARCH_PORT_9200_TCP_ADDR=<es_host> --env ELASTICSEARCH_PORT_9200_TCP_PORT=<es_port> --volume /var/run/docker.sock:/var/run/docker.sock docker-monitor`

This container containers three things.
1. Http Proxy listening on port 9200 as a proxy to a remote elasticsearch service
2. Logstash agent listening on TCP port 9998 for new metrics
3. Docker monitor agent which reads metrics from docker and forwards them to logstash

