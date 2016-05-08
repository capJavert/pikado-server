
//var app = require('http').createServer(handler);
//var express = require("express")();
var express = require("express");
//var app = require("express")();
var app = express();
var http = require("http").Server(app);

var path = require("path");

//var io = require('socket.io')(app);
var io = require('socket.io')(http);
var SerialPort = require('serialport');


//previous was app.listen(3000);
http.listen(3000);

//Enabling CORS - for specific localhost port
app.use(function (req, res, next){

	res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
	res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
	res.setHeader('Access-Control-Allow-Credentials', true);
	
	next();
});

function handler(req, res){
    console.log(req, res);
}



    var serialPort = new SerialPort.SerialPort("/dev/ttyAMA0", {
        baudrate: 9600,
        dataBits: 8,
        parity: "none",
        stopBits: 1,
        flowControl: false
    });

    var counter = 0;

    serialPort.on("open", function () {
        console.log("open");
        var service = new Service();

        serialPort.on("data", function (data) {
            var hexData = data.toString('hex');
            console.log(data, hexData);
            io.emit('hit', data);
            /*var bytes = new Uint8Array(data);
            var buffer = [];
            for (i = 0; i < bytes.length; i++) {
                var a = "";
                a += bytes[i];
                buffer.push(a);
            }

            console.log(buffer);
            var hit = {};
            if (buffer.length >= 4) {
                //console.log(buffer);
                hit = service.mapCodeToHit(buffer);
                console.log(hit);

                io.emit('hit', hit);
            }*/
        });
    });


io.on('connection', function(socket){
    console.log('Connected');
	
	//nsmrcek - custom code for accepting data from client side
	socket.on("Game:init",function(data){
		//was socket.emit
		io.emit("gameMonitor:init",data);
	});
	socket.on("Game:displayScore",function(data){
		io.emit("gameMonitor:displayScore", data);
	});
	socket.on("Game:dartStuck",function(data){
		io.emit("gameMonitor:dartStuck", data);
		console.log("Dart stuck",data);
	});
	socket.on("Game:endGame", function(data){
		io.emit("gameMonitor:endGame", data);
		console.log("EndGame",data);
	});
	socket.on("Game:mainMenu", function(data){
		io.emit("gameMonitor:waitGame", data);
		console.log("WaitGame",data);
	});

});




app.use(express.static(path.join(__dirname, '/')));

//app.use('/js', express.static(path.join(__dirname,

app.get("/home",function(req,res,next){
	//res.send("OK");
	//if fails path incorrect
	res.sendFile(path.join(__dirname + "/index.html"));
	//res.render("index.html");
});


function Service() {
    this.mapCodeToHit = function (data) {
        var hit = {};
        hit.score = 0;
        hit.multiplier = 1;
        hit.hitValid = false;
        hit.irSensor = false;
        hit.dartStuck = false;
        hit.message = "";
        var bytes = new Uint8Array(data);
        var byte0 = bytes[0];
        var byte1 = bytes[1];
        var byte2 = bytes[2];
        var byte3 = bytes[3];

        if (byte0 == 90 && byte1 == 165 && byte2 == (255 - byte3)) {
            if (0 < byte2 && byte2 <= 25) {
                hit.score = byte2;
                hit.multiplier = 1;
                hit.hitValid = true;
            }
            else if (100 < byte2 && byte2 <= 125) {
                hit.score = byte2 - 100;
                hit.multiplier = 2;
                hit.hitValid = true;
            }
            else if (200 < byte2 && byte2 <= 220) {
                hit.score = byte2 - 200;
                hit.multiplier = 3;
                hit.hitValid = true;
            }
            else if (150 < byte2 && byte2 <= 170) {
                hit.score = byte2 - 150;
                hit.multiplier = 4;
                hit.hitValid = true;
            }
            else if (byte2 == 48) {
                hit.message = "Player button";
            }
            else if (byte2 == 64) {
                hit.message = "Dart stuck!";
                hit.dartStuck = true;
            }
            else if (byte2 == 80) {
                hit.message = "IR sensor";
                hit.irSensor = true;
            }
            else if (byte2 == 96) {
                hit.score = -1;
                hit.multiplier = 1;
                hit.hitValid = true;
                hit.message = "TUP";
            }
        }
        else {
            hit.message = "Error in code.";
        }
        return hit;
    };
}