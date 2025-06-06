const mineflayer = require('mineflayer');
const fs = require('fs');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('Bot is alive!'));
app.listen(PORT, () => console.log(`Web server running on port ${PORT}`));

// إعداد المتغيرات العامة
let rawdata = fs.readFileSync('config.json');
let config = JSON.parse(rawdata);
let host = config["ip"];
let port = config["port"];

const pi = 3.14159;
const actions = ['forward', 'back', 'left', 'right'];
const moveinterval = 2; // ثواني
const maxrandom = 5;

let bot;
let connected = 0;
let moving = 0;
let lasttime = -1;
let lastaction;

// توليد اسم عشوائي
function generateRandomName() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let name = 'Bot_';
  for (let i = 0; i < 6; i++) {
    name += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return name;
}

// بدء البوت
function startBot() {
  const username = generateRandomName();
  bot = mineflayer.createBot({ host, port, username });

  console.log(`🚀 بدء البوت باسم: ${username}`);

  bot.on('login', () => {
    console.log(`✅ Logged in as ${username}`);
  });

  bot.on('spawn', () => {
    connected = 1;
    console.log('🌍 Spawned in the world');

    // حركة عشوائية، نظر وضرب
    setInterval(() => {
      if (!connected) return;

      const randomAdd = Math.random() * maxrandom * 20;
      const interval = moveinterval * 20 + randomAdd;

      if (bot.time.age - lasttime > interval) {
        if (moving === 1) {
          bot.setControlState(lastaction, false);
          moving = 0;
        } else {
          const yaw = Math.random() * pi - (0.5 * pi);
          const pitch = Math.random() * pi - (0.5 * pi);
          bot.look(yaw, pitch, false);
          lastaction = actions[Math.floor(Math.random() * actions.length)];
          bot.setControlState(lastaction, true);
          bot.activateItem(); // تفعيل اليد
          bot.swingArm(); // الضرب (محاولة كسر)
          moving = 1;
        }
        lasttime = bot.time.age;
      }
    }, 1000);
  });

  // إعادة التشغيل عند الطرد أو انتهاء الاتصال
  const restart = (reason) => {
    connected = 0;
    console.log(`🔄 إعادة الاتصال خلال 10 ثوانٍ...`, reason ? `(${reason})` : '');
    setTimeout(() => {
      startBot();
    }, 10000);
  };

  bot.on('kicked', (reason) => {
    console.log('❌ تم طرد البوت:', reason);
    restart(reason);
  });

  bot.on('end', () => {
    console.log('⚠️ الاتصال انقطع.');
    restart();
  });

  bot.on('error', (err) => {
    console.log('💥 خطأ:', err.message);
    restart(err.message);
  });

  // تغيير الاسم كل ساعة
  setTimeout(() => {
    console.log('⏳ تغيير الاسم بعد ساعة...');
    if (bot) bot.quit();
  }, 60 * 60 * 1000); // 1 ساعة
}

startBot();