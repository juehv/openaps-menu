// scripts/text_status.js
// Text based APS status screen 
//
// Author: juehv
// License: AGPLv3

/*jslint node: true */
/*jslint esversion: 6 */

'use strict';

var fs = require('fs');
var font = require('oled-font-5x7');
var dns = require('dns');
//const {execSync} = require('child_process');

// Rounds value to 'digits' decimal places
function round(value, digits)
{
  if (! digits) { digits = 0; }
  var scale = Math.pow(10, digits);
  return Math.round(value * scale) / scale;
}

function convert_bg(value, profile)
{
  if (profile != null && profile.out_units == "mmol/L")
  {
    return round(value / 18, 1).toFixed(1);
  }
  else
  {
    return Math.round(value);
  }
}

function stripLeadingZero(value)
{
  var re = /^(-)?0+(?=[\.\d])/;
  return value.toString().replace( re, '$1');
}

function drawReservoirIcon (display, x0, y0, fill){
  // Print Battery first
  var pixels = [
    [x0+4, y0, 1],
    [x0+5, y0, 1],
    [x0+6, y0, 1],
    [x0+7, y0, 1],
    [x0+8, y0, 1],
    [x0+9, y0, 1],
    [x0+10, y0, 1],
    [x0+11, y0, 1],
    [x0+12, y0, 1],
    [x0+13, y0, 1],
    [x0+14, y0, 1],
    //
    [x0+3, y0+1, 1],
    [x0+4, y0+1, 1],
    [x0+14, y0+1, 1],
    [x0+17, y0+1, 1],
    //
    [x0+2, y0+2, 1],
    [x0+3, y0+2, 1],
    [x0+14, y0+2, 1],
    [x0+17, y0+2, 1],
    //
    [x0+1, y0+3, 1],
    [x0+2, y0+3, 1],
    [x0+14, y0+3, 1],
    [x0+15, y0+3, 1],
    [x0+16, y0+3, 1],
    [x0+17, y0+3, 1],
    //
    [x0, y0+4, 1],
    [x0+1, y0+4, 1],
    [x0+14, y0+4, 1],
    [x0+15, y0+4, 1],
    [x0+16, y0+4, 1],
    [x0+17, y0+4, 1],
    //
    [x0+1, y0+5, 1],
    [x0+2, y0+5, 1],
    [x0+14, y0+5, 1],
    [x0+15, y0+5, 1],
    [x0+16, y0+5, 1],
    [x0+17, y0+5, 1],
    //
    [x0+2, y0+6, 1],
    [x0+3, y0+6, 1],
    [x0+14, y0+6, 1],
    [x0+17, y0+6, 1],
    //
    [x0+3, y0+7, 1],
    [x0+4, y0+7, 1],
    [x0+14, y0+7, 1],
    [x0+17, y0+7, 1],
    //
    [x0+4, y0+8, 1],
    [x0+5, y0+8, 1],
    [x0+6, y0+8, 1],
    [x0+7, y0+8, 1],
    [x0+8, y0+8, 1],
    [x0+9, y0+8, 1],
    [x0+10, y0+8, 1],
    [x0+11, y0+8, 1],
    [x0+12, y0+8, 1],
    [x0+13, y0+8, 1],
    [x0+14, y0+8, 1]
  ];  
  display.oled.drawPixel(pixels, false);
  
  // print fill level
  if (fill >= 50){
    display.oled.fillRect(x0+11, y0+2, 2, 5, 1, false);
  }
  if (fill >= 100){
    display.oled.fillRect(x0+8, y0+2, 2, 5, 1, false);  
  }
  if (fill >= 230){
    display.oled.fillRect(x0+5, y0+2, 2, 5, 1, false);
  
  }
  
  if (fill < 0){
    display.oled.drawLine(x0+5, y0+1, x0+14, y0+7, 1, false);
  }
}

function drawBatteryIcon (display, x0, y0, fill){
  // Print Battery first
  var pixels = [
    [x0+2, y0, 1],
    [x0+3, y0, 1],
    [x0+4, y0, 1],
    [x0+5, y0, 1],
    [x0+6, y0, 1],
    [x0+7, y0, 1],
    [x0+8, y0, 1],
    [x0+9, y0, 1],
    [x0+10, y0, 1],
    [x0+11, y0, 1],
    [x0+12, y0, 1],
    [x0+13, y0, 1],
    //
    [x0+2, y0+1, 1],
    [x0+13, y0+1, 1],
    //
    [x0, y0+2, 1],
    [x0+1, y0+2, 1],
    [x0+2, y0+2, 1],
    [x0+13, y0+2, 1],
    //
    [x0, y0+3, 1],
    [x0+2, y0+3, 1],
    [x0+13, y0+3, 1],
    //
    [x0, y0+4, 1],
    [x0+2, y0+4, 1],
    [x0+13, y0+4, 1],
    //
    [x0, y0+5, 1],
    [x0+2, y0+5, 1],
    [x0+13, y0+5, 1],
    //
    [x0, y0+6, 1],
    [x0+1, y0+6, 1],
    [x0+2, y0+6, 1],
    [x0+13, y0+6, 1],
    //
    [x0+2, y0+7, 1],
    [x0+13, y0+7, 1],
    //
    [x0+2, y0+8, 1],
    [x0+3, y0+8, 1],
    [x0+4, y0+8, 1],
    [x0+5, y0+8, 1],
    [x0+6, y0+8, 1],
    [x0+7, y0+8, 1],
    [x0+8, y0+8, 1],
    [x0+9, y0+8, 1],
    [x0+10, y0+8, 1],
    [x0+11, y0+8, 1],
    [x0+12, y0+8, 1],
    [x0+13, y0+8, 1]
  ];  
  display.oled.drawPixel(pixels, false);
  
  // print fill level
  if (fill >= 20){
    display.oled.fillRect(x0+10, y0+2, 2, 5, 1, false);
  }
  if (fill >= 50){
    display.oled.fillRect(x0+7, y0+2, 2, 5, 1, false);  
  }
  if (fill >= 90){
    display.oled.fillRect(x0+4, y0+2, 2, 5, 1, false);
  
  }
  
  if (fill < 0){
    display.oled.drawLine(x0+3, y0+1, x0+12, y0+7, 1, false);
  }
}

// deprecated but I don't want to delete it :D
function drawConnectIcon (display, x0, y0, connected){
  x0 = x0+1;
  x1 = x0+11;
  y1 = y0+6;
  display.oled.drawLine(x0, y0, x0+4, y0, 1, false); //top
  display.oled.drawLine(x0, y0, x0+2, y0+3, 1, false); //left
  display.oled.drawLine(x0+4, y0, x0+2, y0+3, 1, false); //right
  display.oled.drawLine(x0+2, y0+3, x0+2, y0+6, 1, false); //bottom
  if (connected){
    display.oled.drawLine(x0+5, y0+3, x0+5, y0+6, 1, false); 
    display.oled.drawLine(x0+6, y0+3, x0+6, y0+6, 1, false);
    display.oled.drawLine(x0+8, y0, x0+8, y0+6, 1, false); 
    display.oled.drawLine(x0+9, y0, x0+9, y0+6, 1, false);
  }
}

function drawWiFiIcon (display, x0, y0){
  var pixels = [
    [x0+2, y0+1, 1],
    [x0+3, y0+1, 1],
    [x0+4, y0+1, 1],
    [x0+5, y0+1, 1],
    [x0+1, y0+2, 1],
    [x0+6, y0+2, 1],
    [x0, y0+3, 1],
    [x0+7, y0+3, 1],
    [x0+3, y0+4, 1],
    [x0+4, y0+4, 1],
    [x0+2, y0+5, 1],
    [x0+5, y0+5, 1],
    [x0+3, y0+7, 1],
    [x0+4, y0+7, 1],
    [x0+3, y0+8, 1],
    [x0+4, y0+8, 1]    
  ];
  
  display.oled.drawPixel(pixels, false);
}

function drawBTIcon (display, x0, y0){
  var pixels = [
    [x0+2, y0, 1],
    [x0+3, y0, 1],
    [x0+2, y0+1, 1],
    [x0+4, y0+1, 1],
    [x0, y0+2, 1],
    [x0+2, y0+2, 1],
    [x0+5, y0+2, 1],
    [x0+1, y0+3, 1],
    [x0+2, y0+3, 1],
    [x0+4, y0+3, 1],
    [x0+2, y0+4, 1],
    [x0+3, y0+4, 1],
    [x0+1, y0+5, 1],
    [x0+2, y0+5, 1],
    [x0+4, y0+5, 1],
    [x0, y0+6, 1],
    [x0+2, y0+6, 1],
    [x0+5, y0+6, 1],
    [x0+2, y0+7, 1],
    [x0+4, y0+7, 1],
    [x0+2, y0+8, 1],
    [x0+3, y0+8, 1]
  ];
  
  display.oled.drawPixel(pixels, false);
}

function drawArrowUp (display, x0, y0){
  height = 16;
  
  var i;
  var max = 2;
  for (i = 0; i <= max; i++) {
    display.oled.drawLine(x0+max-i, y0+2*i, x0+max+1+i, y0+2*i, 1, false);
    display.oled.drawLine(x0+max-i, y0+2*i+1, x0+max+1+i, y0+2*i+1, 1, false);
  } 
  display.oled.drawLine(x0+max, y0+2*max, x0+max, y0+height, 1, false); //line
  display.oled.drawLine(x0+1+max, y0+2*max, x0+1+max, y0+height, 1, false); //line
}

function drawArrowDown (display, x0, y0){
  height = 16;
  y1 = y0+ height;
  var i;
  var max = 2;
  for (i = max; i >= 0; i--) {
    display.oled.drawLine(x0+max-i, y1-2*i, x0+max+1+i, y1-2*i, 1, false);
    display.oled.drawLine(x0+max-i, y1-2*i-1, x0+max+1+i, y1-2*i-1, 1, false);
  } 
  display.oled.drawLine(x0+max, y0, x0+max, y0+height, 1, false); //line
  display.oled.drawLine(x0+1+max, y0, x0+1+max, y0+height, 1, false); //line
}

module.exports = textStatus;

//
//Start of status display function
//

function textStatus(display, openapsDir) {

display.oled.clearDisplay(true); //clear the buffer

//Parse all the .json files we need
try {
    var profile = JSON.parse(fs.readFileSync(openapsDir+"/settings/profile.json"));
} catch (e) {
    // Note: profile.json is optional as it's only needed for mmol conversion for now. Print an error, but not return
    console.error("Status screen display error: could not parse profile.json: ", e);
}
try {
    var batterylevel = JSON.parse(fs.readFileSync(openapsDir+"/monitor/edison-battery.json"));
} catch (e) {
    console.error("Status screen display error: could not parse edison-battery.json: ", e);
}
try {
    var pumpBatterylevel = JSON.parse(fs.readFileSync(openapsDir+"/monitor/battery.json"));
} catch (e) {
    console.error("Status screen display error: could not parse battery.json: ", e);
}
try {
    var bg = JSON.parse(fs.readFileSync(openapsDir+"/monitor/glucose.json"));
} catch (e) {
    console.error("Status screen display error: could not parse glucose.json: ", e);
}
try {
    var iob = JSON.parse(fs.readFileSync(openapsDir+"/monitor/iob.json"));
} catch (e) {
    console.error("Status screen display error: could not parse iob.json: ", e);
}
try {
    var cob = JSON.parse(fs.readFileSync(openapsDir+"/monitor/meal.json"));
} catch (e) {
    console.error("Status screen display error: could not parse meal.json: ", e);
}
try {
    var tmpBasal = JSON.parse(fs.readFileSync(openapsDir+"/monitor/temp_basal.json"));
} catch (e) {
    console.error("Status screen display error: could not parse temp_basal.json");
}
try {
    var stats = fs.statSync("/tmp/pump_loop_success");
} catch (e) {
    console.error("Status screen display error: could not find pump_loop_success");
}
try {
    var reservoir = JSON.parse(fs.readFileSync(openapsDir+"/monitor/reservoir.json"));
    console.log(reservoir); 
} catch (e) {
    console.error("Status screen display error: could not parse reservoir.json: ", e);
}

// BEGIN Symbol Line (from left to right)

// show pump battery level
if(pumpBatterylevel && pumpBatterylevel.voltage) { 
  // set your battery voltage here
  var voltageHigh = 1.7;
  var voltageLow = 1.4;
  
  var battlevel = ((pumpBatterylevel.voltage - voltageLow) / (voltageHigh - voltageLow)) * 100.0;
  battlevel = (battlevel > 100 ? 100 : battlevel);    
  drawBatteryIcon(display, 0, 0 ,battlevel);
} else {
  drawBatteryIcon(display, 0, 0 ,-1);
}

// show pump reservoir icon
if (reservoir){
  drawReservoirIcon(display, 22, 0, reservoir);
} else {
  drawReservoirIcon(display, 22, 0, -1);
}

// show current time
var nowDate = new Date();
var hour = nowDate.getHours();
hour = (hour < 10 ? "0" : "") + hour;
var min  = nowDate.getMinutes();
min = (min < 10 ? "0" : "") + min;

display.oled.setCursor(50,1);
display.oled.writeString(font, 1, hour+":"+min, 1, false, 0, false);

// Bluetooth Icon (for Logger conneciton? or bt teathering?)
// TODO implement
// drawBTIcon(display, 101, 0);

// show online connection icon if connected to wifi
// TODO maybe split BT and WiFi later ...
try {
  //let isOnline = execSync('ifconfig | grep wlan0 -A 1 | grep -q inet');
  if (fs.existsSync('/tmp/hasPublicIp')){
     drawWiFiIcon(display, 86, 0);
  } else {
     //drawWiFiIcon(display, 88, 0, false);
  }
} catch (e) {
  //drawWiFiIcon(display, 88, 0, false);
}

// show local battery level
if(batterylevel) {
  drawBatteryIcon(display, 113, 0 , batterylevel.battery);
} else {
  drawBatteryIcon(display, 113, 0 ,-1);
}

// END Symbol Line

//calculate timeago for BG
if(bg && profile) {
    var startDate = new Date(bg[0].date);
    var endDate = new Date();
    var minutes = Math.round(( (endDate.getTime() - startDate.getTime()) / 1000) / 60);
    if (bg[0].delta) {
        var delta = Math.round(bg[0].delta);
    } else if (bg[1] && bg[0].date - bg[1].date > 200000 ) {
        var delta = Math.round(bg[0].glucose - bg[1].glucose);
    } else if (bg[2] && bg[0].date - bg[2].date > 200000 ) {
        var delta = Math.round(bg[0].glucose - bg[2].glucose);
    } else if (bg[3] && bg[0].date - bg[3].date > 200000 ) {
        var delta = Math.round(bg[0].glucose - bg[3].glucose);
    } else {
        var delta = 0;
    }

    //display BG number, add plus sign if delta is positive 
    display.oled.setCursor(0,13);
    display.oled.writeString(font, 3, ""+convert_bg(bg[0].glucose, profile), 1, false, 0, false);
    var curPos = display.oled.cursor_x + 1 ;
    if (minutes >= 11 ){
      display.oled.fillRect(0, 25, curPos, 3, 1, false);
    } else if (delta) {
      if (delta >= 5) {
        drawArrowUp(display, curPos+3, 15);
      } else if ( delta <= -5){
        drawArrowDown(display, 55, 15);
      }
      if (delta >= 10) {
        drawArrowUp(display, curPos+10, 15);
      } else if ( delta <= -10){
        drawArrowDown(display, 65, 15);
      }
    }
}

//parse and render COB/IOB
if(iob) {
  display.oled.setCursor(85,13); //39
  var iob = round(iob[0].iob, 1).toFixed(1);
  if (iob >= 10.0) {
    display.oled.setCursor(95,13);
    iob = round(iob);
  }
  display.oled.writeString(font, 2, iob+"U", 1, false, 0, false);
}

if(cob) {
  display.oled.setCursor(0,37);
  display.oled.writeString(font, 1, "COB: "+round(cob.mealCOB, 1).toFixed(1)+"g", 1, false, 0, false);
}

// show tmp basal info
if(tmpBasal) {
  display.oled.setCursor(0,47);
  display.oled.writeString(font, 1, "tB : "+round(tmpBasal.rate,1).toFixed(1)+"U("+tmpBasal.duration+")", 1, false, 0, false);
}
//calculate timeago for last successful loop
if(stats) {
  var startDate = new Date(stats.mtime);
  var endDate = new Date();
  var minutes = Math.round(( (endDate.getTime() - startDate.getTime()) / 1000) / 60);

  //display last loop time
  display.oled.setCursor(0,57);
  display.oled.writeString(font, 1, "llp: "+minutes+"m ", 1, false, 0, false);
}


display.oled.dimDisplay(true); //dim the display
display.oled.update(); // write buffer to the screen


fs.readFile(openapsDir+"/preferences.json", function (err, data) {
  if (err) throw err;
  preferences = JSON.parse(data);
  if (preferences.wearOLEDevenly && preferences.wearOLEDevenly.includes("off")) {
    display.oled.invertDisplay(false);
  }
  else if (preferences.wearOLEDevenly && preferences.wearOLEDevenly.includes("nightandday") && (hour >= 20 || hour <= 8)) {
    display.oled.invertDisplay(false);
  }
  else if (preferences.wearOLEDevenly && preferences.wearOLEDevenly.includes("nightandday") && (hour <= 20 && hour >= 8)) {
    display.oled.invertDisplay(true);
  }
  else {
    display.oled.invertDisplay((endDate % 2 == 1));
  }
});

 //
}//End of status display function
 //


