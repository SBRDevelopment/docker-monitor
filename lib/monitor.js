var docker 		= require('docker-remote-api'),
	async 		= require('async'),
	bunyan 		= require('bunyan'),
	bunyantcp 	= require('bunyan-logstash-tcp'),
	throttle	= require('./throttle')

function Monitor(argv) {
	this.argv = argv;
	this.timer = null;

	this.stream = bunyantcp.createStream({
		host: this.argv.host,
		port: this.argv.port,
		max_connect_retries: 10,
		retry_interval: 5000
	}).on('error', this.onStreamError.bind(this));

	this.log = bunyan.createLogger({
		name: 'docker-monitor',
		streams: [{
			level: 'info',
			type: "raw",
			stream: this.stream
		}],
		level: 'info'
	});

	this.request = docker({
	  host: this.argv.docker
	})

};

Monitor.prototype = {
	main: function(next) {
		this.getContainers(next)
	},
	getContainers: function(next) {
		this.bindAll(next)
		this.request.get('/containers/json', {json: true}, this.parseContainers);
	},
	parseContainers: function(next, err, containers) {
		if(!err) {
			async.each(containers, this.getStats, this.onError)
		} else {
			if(err.code == "EACCES")
				this.onError("EACCESS, Permission Denied when trying to access " + this.argv.docker)
			else
				this.onError(err.message)
		}
	},
	getStats: function(next, container, callback) {
		this.request.get('/containers/' + container.Id + '/stats?stream=false', {json: true}, this.parseStats.bind(this, next, callback, container))
	},
	parseStats: function(next, callback, container, err, stats) {
		if(!err) {
			var containerStats = {
				id: container.Id,
				image: container.Image,
				cpu_percent: this.calculateCpuPercent(stats),
				memory: stats.memory_stats.usage,
				memory_limit: stats.memory_stats.limit,
				mem_percent: this.calculateMemPercent(stats),
				network_rx: stats.network.rx_bytes,
				network_tx: stats.network.tx_bytes
			}
			this.report(containerStats)
			callback()
		} else {
			this.onError(err)
		}
	},
	calculateCpuPercent: function(stats) {
		var cpuPercent = 0.0
		var cpuDelta = stats.cpu_stats.cpu_usage.total_usage - stats.precpu_stats.cpu_usage.total_usage
		var sysDelta = stats.cpu_stats.system_cpu_usage - stats.precpu_stats.system_cpu_usage
		if(cpuDelta > 0.0 && sysDelta > 0.0) {
			cpuPercent = (cpuDelta / sysDelta) * stats.cpu_stats.cpu_usage.percpu_usage.length * 100.0
		}
		return cpuPercent
	},
	calculateMemPercent: function(stats) {
		return stats.memory_stats.usage / stats.memory_stats.limit * 100.0
	},
	report: function(stats) {
		console.log("Metric collected for %s", stats.id)
		this.log.info(stats)
	},
	onStreamError: function(err) {
		console.log("> Waiting for logstash on %s:%s, will retry in %ss", this.argv.host, this.argv.port, this.argv.interval)
	},
	onError: function(next, err) {
		if(err) {
			console.log("Error: " + err);	
		} 
		next()
	},
	bindAll: function(next) {
		this.parseContainers = Monitor.prototype.parseContainers.bind(this, next)
		this.getStats = Monitor.prototype.getStats.bind(this, next)
		this.onError = Monitor.prototype.onError.bind(this, next)
	},
	start: function() {
		var tMain = throttle(this.main, this.argv.interval * 1000)
		async.forever(tMain.bind(this), this.onError);
	}
};

module.exports = Monitor;