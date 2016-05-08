var SerialPort = require("serialport");
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
        //console.log(data, hexData);
        var bytes = new Uint8Array(data);
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
        }
    });
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
