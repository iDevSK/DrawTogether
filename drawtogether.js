 (function(app, io){
	var socket,
		canvas,
		ctx,
		painting = false,
		lastX = 0,
		lastY = 0,
		lineThickness = 1,
		fillStyle = '#fff';

	var draw = function(x, y, prevX, prevY, fillColor) {
			ctx.fillStyle = fillColor;
	    // find all points between
	    var x1 = x,
	        x2 = prevX,
	        y1 = y,
	        y2 = prevY;

	    var steep = (Math.abs(y2 - y1) > Math.abs(x2 - x1));
	    if (steep){
	        var x = x1;
	        x1 = y1;
	        y1 = x;

	        var y = y2;
	        y2 = x2;
	        x2 = y;
	    }
	    if (x1 > x2) {
	        var x = x1;
	        x1 = x2;
	        x2 = x;

	        var y = y1;
	        y1 = y2;
	        y2 = y;
	    }

	    var dx = x2 - x1,
	        dy = Math.abs(y2 - y1),
	        error = 0,
	        de = dy / dx,
	        yStep = -1,
	        y = y1;

	    if (y1 < y2) {
	        yStep = 1;
	    }

	    lineThickness = 5 - Math.sqrt((x2 - x1) *(x2-x1) + (y2 - y1) * (y2-y1))/10;
	    if(lineThickness < 1){
	        lineThickness = 1;
	    }

	    for (var x = x1; x < x2; x++) {
	        if (steep) {
	            ctx.fillRect(y, x, lineThickness , lineThickness );
	        } else {
	            ctx.fillRect(x, y, lineThickness , lineThickness );
	        }

	        error += de;
	        if (error >= 0.5) {
	            y += yStep;
	            error -= 1.0;
	        }
	    }
	};
	
	var reset = function() {
		ctx.fillStyle = "#efefef";
		ctx.fillRect(0, 0, 1700, 800);
	}	
	
	app.initialize = function(canvasId) {
		// Get the canvas and context
		canvas = document.getElementById(canvasId);
		ctx = canvas.getContext('2d');
		canvas.width = 1700;
		canvas.height = 800;
		ctx.fillStyle = "#efefef";
		ctx.fillRect(0, 0, 1700, 800);

		if(io) {
			socket = io.connect('http://10.0.16.247:3000');
			socket.on('color', function (data) {
				console.log('On color');
				fillStyle = data.hex;
			});

			socket.on('draw', function(data) {
				draw(data.x, data.y, data.prevX, data.prevY, data.color);
			});
			
			socket.on('reset', function(data) {
				console.log('On reset');
				reset();
				
			});
		}
		// Initialize our functions to listen for events
		canvas.onmousedown = function(e) {
			painting = true;
			lastX = e.pageX - this.offsetLeft;
			lastY = e.pageY - this.offsetTop;
		};

		canvas.onmouseup = function(e) {
			painting = false;
		};

		canvas.onmousemove = function(e) {
			if(painting) {
				var mouseX = e.pageX - this.offsetLeft,
					mouseY = e.pageY - this.offsetTop;
				draw(mouseX, mouseY, lastX, lastY, fillStyle);
				if(socket) {
					socket.emit('draw', {x : mouseX, y : mouseY, prevX : lastX, prevY : lastY, color: fillStyle});
				}
				lastX = mouseX;
				lastY = mouseY;
			}
		}

		var btnReset = document.getElementById('btnReset');
		btnReset.onclick = function() {
			if(confirm('All users canvas reset'))
			{			
				if(socket) {
					socket.emit('reset', {});
					reset();
				}
			}
		};
	  };
    })(window.drawTogether = window.drawTogether || {}, io);