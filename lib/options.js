var Optimist = require('optimist')
	.usage('Monitors docker containers stats\nUsage: $0')
	.options('help', {
		describe: 'Display help message and usage'
	})
	.options('i', {
		alias: 'interval',
		describe: 'Polling interval in seconds for container statistics',
		default: 5
	})
	.options('p', {
		alias: 'port',
		describe: 'Logstash TCP port to send logs',
		default: 9998
	})
	.options('h', {
		alias: 'host',
		describe: 'Logstash TCP host to send logs',
		default: '127.0.0.1'
	})
	.options('d', {
		alias: 'docker',
		describe: 'Docker TCP or Socket configuration',
		default: '/var/run/docker.sock'
	})
	.options('proxy-port', {
		describe: 'Proxy port for ElasticSearch',
		default: 9200
	})

if(Optimist.argv.help) {
	console.log(Optimist.help());
	process.exit(0);
}

module.exports = Optimist;