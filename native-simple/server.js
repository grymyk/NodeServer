'use strict';

const http = require('http');

const hostname = '127.0.0.1';
const port = 3000;

let me = {
	name: 'jura',
	age: 22
};

let routing = {
  '/': '<h1>welcome to homepage</h1><hr />',
  '/user': me,
  '/user/name': () => me.name,
  '/user/age': () => me.age,
  '/hello': {
				hello: 'world',
				andArray: [1, 2, 3, 4, 5, 6, 7]
			}
};

let types = {
	object: obj => JSON.stringify(obj),
	string: str => str,
	undefined: () => 'Not Found',
	function: (fn, req, res) => fn(req, res) + '',
};

http.createServer( (req, res) => {
	let data = routing[req.url];
	let result = types[typeof data](data, req, res);
	
	res.end(result);
}).listen(port, hostname, () => {
	console.log(`Server running at http://${hostname}:${port}/`);
});

