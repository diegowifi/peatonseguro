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
    m2x: { driver: "m2x", id: "9381f014d65b5e3d4b9fe4398c0b9f33", connection: "m2x" },
    sensor: { driver: "ir-range-sensor", pin: 0, upperLimit: 400, lowerLimit: 100, model: "gp2y0a41sk0f" }
  },
  work: function(my) {
    my.screen.setColor(255,0,0);
    my.m2x.subscribe("boton", { interval: 1000 });

    my.m2x.on("error", function(err) {
      console.log("m2x error: ", err);
    });

    //Sensor de proximidad
    var mraa = require('mraa'); //require mraa
    console.log('MRAA Version: ' + mraa.getVersion()); 
    

    while(true){
    every((1).seconds(), function() {
      var range = my.sensor.range();
      console.log("Range ===>", range);
    });

          ////////////////////////////
          setTimeout(function(){
          var exec = require('child_process').exec, child;
          child = exec('fswebcam -r 1280x720 image.jpeg',
              function (error, stdout, stderr) {
                  console.log('stdout: ' + stdout);
                  console.log('stderr: ' + stderr);
                  if (error !== null) {
                       console.log('exec error: ' + error);
                  }
              });
          },2000);


          /////////////////////////////

          setTimeout(function(){
            var oxford = require('project-oxford'),
            client = new oxford.Client('629a3102a0014fba93eb824efc8882a8');

            client.vision.ocr({
                path: 'image.jpeg',
                language: 'en'
            }).then(function (response) {
                console.log(response.body);
            });
          },5000);

          

          /////////////////////////////

          setTimeout(function(){
            my.m2x.publish("boton", "1234,SFC-86-62,1", function(err) {
              if (err) {
                console.log("err: ", err);
              }
            });
          },7000);



          /////////////////////////////
      }
  }
}).start();