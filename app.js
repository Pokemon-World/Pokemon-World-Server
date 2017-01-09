'use strict';

const fs = require('fs');
const path = require('path');

/*********************************************************
 * Make sure we have everything set up correctly
 *********************************************************/

// Make sure our dependencies are available, and install them if they
// aren't

try {
	require.resolve('sockjs');
} catch (e) {
	if (require.main !== module) throw new Error("Dependencies unmet");

	let command = 'npm install --dependencies';
	console.log('Loading... dependencies: `' + command + '`...');
	require('child_process').spawnSync('sh', ['-c', command], {stdio: 'inherit'});
}

/*********************************************************
 * Load configuration
 *********************************************************/

try {
	require.resolve('./config/config');
} catch (err) {
	if (err.code !== 'MODULE_NOT_FOUND') throw err; // should never happen

	// Copy it over synchronously from config-example.js since it's needed before we can start the server
	console.log("Config is setup by default...");
	fs.writeFileSync(path.resolve(__dirname, 'config/config.js'),
		fs.readFileSync(path.resolve(__dirname, 'config/config-example.js'))
	);
} finally {
	global.Config = require('./config/config');
}

if (Config.watchconfig) {
	let configPath = require.resolve('./config/config');
	fs.watchFile(configPath, (curr, prev) => {
		if (curr.mtime <= prev.mtime) return;
		try {
			delete require.cache[configPath];
			global.Config = require('./config/config');
			if (global.Users) Users.cacheGroupData();
			console.log('Reloaded config.js');
		} catch (e) {
			console.log('Error reloading config/config.js: ' + e.stack);
		}
	});
}

/*********************************************************
 * Set up most of our globals
 *********************************************************/

global.Monitor = require('./monitor');

global.Tools = require('./tools');
global.toId = Tools.getId;

global.LoginServer = require('./loginserver');

global.Ladders = require(Config.remoteladder ? './ladders-remote' : './ladders');

global.Users = require('./users');

global.Punishments = require('./punishments');

global.Chat = require('./chat');

global.Rooms = require('./rooms');

delete process.send; // in case we're a child process
global.Verifier = require('./verifier');
Verifier.PM.spawn();

global.Tournaments = require('./tournaments');

global.Dnsbl = require('./dnsbl');
Dnsbl.loadDatacenters();

if (Config.crashguard) {
	// graceful crash - allow current battles to finish before restarting
	process.on('uncaughtException', err => {
		let crashType = require('./crashlogger')(err, 'The main process');
		if (crashType === 'lockdown') {
			Rooms.global.startLockdown(err);
		} else {
			Rooms.global.reportCrash(err);
		}
	});
	process.on('unhandledRejection', err => {
		throw err;
	});
}

/*********************************************************
 * Start networking processes to be connected to
 *********************************************************/

global.Sockets = require('./sockets');

exports.listen = function (port, bindAddress, workerCount) {
	Sockets.listen(port, bindAddress, workerCount);
};

if (require.main === module) {
	// if running with node app.js, set up the server directly
	// (otherwise, wait for app.listen())
	let port;
	if (process.argv[2]) {
		port = parseInt(process.argv[2]); // eslint-disable-line radix
	}
	Sockets.listen(port);
}

/*********************************************************
 * Set up our last global
 *********************************************************/

// Generate and cache the format list.
Tools.includeFormats();

global.TeamValidator = require('./team-validator');
TeamValidator.PM.spawn();

/*********************************************************
 * Start up the REPL server
 *********************************************************/

require('./repl').start('app', cmd => eval(cmd));
