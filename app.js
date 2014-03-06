var http = require('http'),
	parse = require('url').parse,
	fs = require('fs'),
	port = process.env.PORT || 3000,
	html = fs.readFileSync('index.html', 'utf8'),
	htmlLength = Buffer.byteLength(html, 'utf8'),
	dtJS = fs.readFileSync('drawtogether.js', 'utf8'),
	dtJSLength = Buffer.byteLength(dtJS, 'utf8'),
	colors = ['#ff0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#8F00FF'],
	colorIndex = 0;

function handler(req, res) {
	var url = parse(req.url);
	if(url.pathname === '/drawtogether.js') {
		res.setHeader('Content-Type', 'application/javascript');
		res.setHeader('Content-Length', dtJSLength);
		return res.end(dtJS);		
	}
	res.setHeader('Content-Type', 'text/html');
	res.setHeader('Content-Length', htmlLength);
	res.end(html);
};

var app = http.createServer(handler),
	io = require('socket.io').listen(app);

// Capture incoming connections
io.sockets.on('connection', function(socket) {
    console.log('Someone Connected!');
    
    socket.emit('color', {hex : colors[colorIndex]});

    colorIndex = ((colorIndex + 1) === colors.length) ? 0 : colorIndex + 1;

    socket.on('draw', function(data) {
    	socket.broadcast.emit('draw', data);
    })
    socket.on('disconnect', function(socket) {
       console.log('Someone Disconnected');
    });
	
	socket.on('reset', function(data) {
		console.log('Function Reset');
		socket.broadcast.emit('reset', data);
	});
});

app.listen(port);