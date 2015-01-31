var net = require('net');
var rl = require('readline');
var command = require('./command');
var log = require('./log')('server');

var server = net.createServer(function(so) {
	var record = so.remoteAddress + ':' + so.remotePort;

	log.info('Connected: ', record);

	so.write('220 (nodejs ftp v0.0)\r\n');
	so.app = {
		user: '-',
		pass: '-',
		cwd: '/',
		vroot: 'e:/'
	};
	so.app.config = {
		data_port: 8889
	};

	so.on('error', function(err) {
		log.error('err:', err);
	});

	so.on('end', function(err) {
		log.info('Disconnected: ', record);
	}.bind({
		record: record
	}));

	rl.createInterface({
		input: so,
		output: so
	}).on('line', function(line) {

		var words = line.split(' ');
		var cmd = words[0].toLowerCase();
		var args = words.slice(1).join(' ');
		log.debug('[' + cmd + '][' + args + ']');

		if (command[cmd]) {
			command[cmd](so, args);
		} else {
			command.unknown(so, args);
		}
	}).on('close', function() {
		so.end();
	}).on('error', function(e) {
		log.info('error' + e);
	});
});

server.on('error', function(err) {
	log.error('error:', err.message);
});

server.listen(6666, function() {
	log.info('server start listen.');
});