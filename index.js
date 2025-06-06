const mineflayer = require('mineflayer')
const fs = require('fs');
const express = require('express'); // إضافة Express

// إعداد express لتشغيل سيرفر على البورت
const app = express();
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('Bot is alive!'));
app.listen(PORT, () => console.log(`Web server running on port ${PORT}`));

// تحميل بيانات الاتصال
let rawdata = fs.readFileSync('config.json');
let data = JSON.parse(rawdata);

var lasttime = -1;
var moving = 0;
var connected = 0;
var actions = ['forward', 'back', 'left', 'right'];
var lastaction;
var pi = 3.14159;
var moveinterval = 2; // 2 second movement interval
var maxrandom = 5; // 0-5 seconds added to movement interval (randomly)
var host = data["ip"];
var port = data["port"];
var username = data["name"];

var bot = mineflayer.createBot({
  host: host,
  port: port,
  username: username
});

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

bot.on('login', function () {
  console.log("Logged In");
});

bot.on('spawn', function () {
  connected = 1;
});

bot.on('time', function () {
  if (connected < 1) return;

  if (lasttime < 0) {
    lasttime = bot.time.age;
  } else {
    var randomadd = Math.random() * maxrandom * 20;
    var interval = moveinterval * 20 + randomadd;

    if (bot.time.age - lasttime > interval) {
      if (moving == 1) {
        bot.setControlState(lastaction, false);
        moving = 0;
        lasttime = bot.time.age;
      } else {
        var yaw = Math.random() * pi - (0.5 * pi);
        var pitch = Math.random() * pi - (0.5 * pi);
        bot.look(yaw, pitch, false);
        lastaction = actions[Math.floor(Math.random() * actions.length)];
        bot.setControlState(lastaction, true);
        moving = 1;
        lasttime = bot.time.age;
        bot.activateItem();
      }
    }
  }
});
