'use strict';

global.api = {};

api.http = require('http');
api.host = '127.0.0.1';
api.port = 3000;
api.cluster = require('cluster');
api.os = require('os');

let me = {
	name: 'jura',
	age: 22
};

let routing = {
	'/': 'welcome to homepage',
	'/user': me,
	'/user/name': () => me.name,
	'/user/age': () => me.age,
	'/user/*': (client, param) => 'parameter=' + param[0]
};

let types = {
	object: obj => JSON.stringify(obj),
	string: str => str,
	number: n => n + '',
	undefined: () => 'Not Found',
	function: (fn, param, client) => fn(client, param)
};

let matching = [];

for (let key in routing) {
	if (key.indexOf('*') !== -1) {
    	let rx = new RegExp(key.replace('*', '(.*)'));
    	
		matching.push([rx, routing[key]]);
    	
		delete routing[key];
	}
}

function router(client) {
	let rx;
	let param;
	let route = routing[client.req.url];

	if (route === undefined) {
    	for (let i = 0, len = matching.length; i < len; i++) {
			rx = matching[i];
			param = client.req.url.match(rx[0]);

			if (param) {
        		param.shift();
        		route = rx[1];
        		
				break;
      		}
    	}
  	}

	let renderer = types[typeof(route)];
  	
	return renderer(route, param, client);
}

if (api.cluster.isMaster) {
	let count = api.os.cpus().length;
	
	for (let i = 0; i < count; i++) {
		api.cluster.fork();
	}
} else {
	api.http.createServer( (req, res) => {
    	res.end(router({ req, res }) + '');
  	}).listen(api.port, api.host, () => {
		console.log(`Listening at http://${api.host}:${api.port}/`);
	});
}

