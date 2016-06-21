"use strict";
var Cylon = require('cylon');

Cylon.api({
  host: "0.0.0.0",
  port: "3000",
  ssl: false
});

Cylon.robot({
  name: "buttonTest",
  connections: {
    edison: { adaptor: "intel-iot" },
    m2x: { adaptor: "m2x", masterKey: "331d8de490ed6baa6b80fc1d07ef3e0a" }
  },
  devices: {
    led: { driver: 'led', pin: 3 },
    button: { driver: 'button', pin: 2 },
    screen: { driver: 'jhd1313m1', connection: "edison" },
    m2x: { driver: "m2x", id: "9381f014d65b5e3d4b9fe4398c0b9f33", connection: "m2x" }
  },
  work: function(my) {
    my.screen.setColor(255,0,0);
    my.m2x.subscribe("boton", { interval: 1000 });

    my.m2x.on("error", function(err) {
      console.log("m2x error: ", err);
    });

      my.button.on('push', function(){

          my.m2x.publish("boton", "1234,SFC-86-62,1", function(err) {
            if (err) {
              console.log("err: ", err);
            }
          });

          var exec = require('child_process').exec, child;

          child = exec('fswebcam -r 1280x720 image.jpeg',
              function (error, stdout, stderr) {
                  console.log('stdout: ' + stdout);
                  console.log('stderr: ' + stderr);
                  if (error !== null) {
                       console.log('exec error: ' + error);
                  }
              });
      });
      
  }
}).start();