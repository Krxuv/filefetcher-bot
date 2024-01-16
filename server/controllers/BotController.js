const { telegramConfig } = require('../configs');
const { constants } = require('../utils');
const { exec } = require('child_process');
const fs = require('fs');
const util = require('util');
const Funcs = require('./Functions');
const Func = new Funcs;
const DB = require('./Database');
const {
  Bcrypt,
  Binary,
  Hex,
  MD5,
  Short,
  Slug,
  UUID,
  Ai,
  BrainLy,
  FB,
  Github,
  Google,
  Instagram,
  Pinterest,
  Spotify,
  Threads,
  Tiktok,
  X,
  Youtube
} = require('../services');
let userLocks = {};

class BotController {
  constructor(bot, body) {
    this.bot = bot;
    this.text = body.message ? body.message.text : ''
    this.body = body;
  }

  async handle() {
    try {
      if (/\$ (.+)/.test(this.text)) {
          let input = this.text.replace('$ ', '');
          exec(input, async (err, stdout) => {
              if (err) await this.bot.sendMessage(this.body.message.chat.id, `Error: ${err}`)
              if (stdout) await this.bot.sendMessage(this.body.message.chat.id, util.format(stdout))
          })
      } else if (constants.COMMAND_SHORT_REGEX.test(this.text)) {
        const short = new Short(this.bot, this.body.message.chat.id, this.text);

        await short.short();
      } else if (constants.COMMAND_SLUG_REGEX.test(this.text)) {
        const slug = new Slug(this.bot, this.body.message.chat.id, this.text);

        await slug.slug();
      } else if (constants.COMMAND_HEX_REGEX.test(this.text)) {
        const hex = new Hex(this.bot, this.body.message.chat.id, this.text);

        await hex.hex();
      } else if (constants.COMMAND_MD5_REGEX.test(this.text)) {
        const mD5 = new MD5(this.bot, this.body.message.chat.id, this.text);

        await mD5.md5();
      } else if (constants.COMMAND_BCRYPT_REGEX.test(this.text)) {
        const bcrypt = new Bcrypt(this.bot, this.body.message.chat.id, this.text);

        await bcrypt.bcrypt();
      } else if (constants.COMMAND_BINARY_REGEX.test(this.text)) {
        const binary = new Binary(this.bot, this.body.message.chat.id, this.text);

        await binary.binary();
      } else if (/\/(help|start|menu)/.test(this.text)) {
        let getban = await Func.getBanned(this.body.message.from.id);
        if (!getban.status) return this.bot.sendMessage(this.body.message.chat.id, `You have been banned\n\nReason : ${getban.reason}\n\nDo you want to be able to use bots again? Please contact the owner to request removal of the ban\nOwner : ${constants.OWNER}`)
  let response = `Hello I am ${constants.BOTNAME}

Please send a link to the video or post you want to download, the bot only supports social media on the list

LIST :
• Threads
• Tiktok
• Instagram
• Twitter
• Facebook
• Pinterest
• Spotify
• Github

DEVELOPER FEATURES
/bcrypt __text__ - Text to bcrypt hash
/binary __text__ - Text to binary
/hex __text__ - HEX to ASCII
/md5 __text__ - Text to MD5 hash
/short __url__ - Short url
/slug __text__ - Slug text
/uuid - Generate UUID

OTHER FEATURES
/ai __text__ - AI uses GPT
/brainly __text__ - Search Questions ( id )
/pin __text__ - Search image on Pinterest
/google __text__ - Search on Google

Bot by ${constants.OWNER}`
        let opts = {
          caption: response,
          reply_markup: JSON.stringify({
            inline_keyboard: [
              [{ text: 'Bot Creator', url: `t.me/${constants.OWNER.replace('@', '')}` }],
              [{ text: 'Source Code Bot', url: `https://github.com/krxuv/filefetcher-bot` }]
            ]
          })
        }
        let database = new DB;
        let db = await database.readDb('/tmp/database.json');
        let chatId = this.body.message.from.id;
        if (!db[chatId]) {
          await database.addUserDb(chatId, '/tmp/database.json');
          await this.bot.sendPhoto(chatId, constants.MENU_THUMB, opts);
          db = await database.readDb('/tmp/database.json');
        } else if (db[chatId]) {
          await this.bot.sendPhoto(chatId, constants.MENU_THUMB, opts);
        }
      } else if (constants.COMMAND_UUID_REGEX.test(this.text)) {
          const uUID = new UUID(this.bot, this.body.message.chat.id, this.text);
          await uUID.uuid();
      } else if (constants.COMMAND_AI_REGEX.test(this.text)) {
        let input = this.text.replace(constants.COMMAND_AI, '');
        let AI = new Ai;
        await AI.getAiResponse(this.bot, this.body.message.chat.id, input, this.body.message.from.username ? this.body.message.from.username : '')
      } else if (constants.COMMAND_GOOGLE_REGEX.test(this.text)) {
          let input = this.text.replace(constants.COMMAND_GOOGLE, '');
          let Googlee = new Google;
          await Googlee.googleSearch(this.bot, this.body.message.chat.id, input, this.body.message.from.username ? this.body.message.from.username : '');
      } else if (constants.COMMAND_BRAINLY_REGEX.test(this.text)) {
          let input = this.text.replace(constants.COMMAND_BRAINLY, '');
          let BRainly = new BrainLy;
          await BRainly.getBrainlyAnswer(this.bot, this.body.message.chat.id, input, this.body.message.from.username ? this.body.message.from.username : '');
      } else if (constants.COMMAND_PINTEREST_S_REGEX.test(this.text)) {
          let input = this.text.replace(constants.COMMAND_PINTEREST_S, '');
          let Pint = new Pinterest;
          await Pint.pinSearch(this.bot, this.body.message.chat.id, input, this.body.message.from.username ? this.body.message.from.username : '');
      } else if (constants.COMMAND_TIKTOK_REGEX.test(this.text)) {
        let getban = await Func.getBanned(this.body.message.from.id);
        if (!getban.status) return this.bot.sendMessage(this.body.message.chat.id, `You have been banned\n\nReason : ${getban.reason}\n\nDo you want to be able to use bots again? Please contact the owner to request removal of the ban\nOwner : ${constants.OWNER}`)
        let userId = this.body.message.from.id.toString();
        if (userLocks[userId]) {
          return;
        }
        userLocks[userId] = true;
        try {
          await this.bot.sendMessage(process.env.OWNER_ID, `[ Usage Log ]\n◇ FIRST NAME : ${this.body.message.from.first_name ? this.body.message.from.first_name : "-"}\n◇ LAST NAME : ${this.body.message.from.last_name ? this.body.message.from.last_name : "-"}\n◇ USERNAME : ${this.body.message.from.username ? "@" + this.body.message.from.username : "-"}\n◇ ID : ${this.body.message.from.id}\n\nContent: ${this.text.slice(0, 1000)}`, { disable_web_page_preview: true })
          let TT = new Tiktok;
          await TT.getTiktokInfo(this.bot, this.body.message.chat.id, this.text, this.body.message.from.username ? this.body.message.from.username : '');
        } finally {
          userLocks[userId] = false;
        }
      } else if (constants.COMMAND_X_REGEX.test(this.text)) {
        let getban = await Func.getBanned(this.body.message.from.id);
        if (!getban.status) return this.bot.sendMessage(this.body.message.chat.id, `You have been banned\n\nReason : ${getban.reason}\n\nDo you want to be able to use bots again? Please contact the owner to request removal of the ban\nOwner : ${constants.OWNER}`)
        let userId = this.body.message.from.id.toString();
        if (userLocks[userId]) {
          return;
        }
        userLocks[userId] = true;
        try {
          await this.bot.sendMessage(process.env.OWNER_ID, `[ Usage Log ]\n◇ FIRST NAME : ${this.body.message.from.first_name ? this.body.message.from.first_name : "-"}\n◇ LAST NAME : ${this.body.message.from.last_name ? this.body.message.from.last_name : "-"}\n◇ USERNAME : ${this.body.message.from.username ? "@" + this.body.message.from.username : "-"}\n◇ ID : ${this.body.message.from.id}\n\nContent: ${this.text.slice(0, 1000)}`, { disable_web_page_preview: true })
          let Xx = new X;
          await Xx.getDatax(this.bot, this.body.message.chat.id, this.text, this.body.message.from.username ? this.body.message.from.username : '');
        } finally {
          userLocks[userId] = false;
        }
      } else if (constants.COMMAND_INSTAGRAM_REGEX.test(this.text)) {
        let getban = await Func.getBanned(this.body.message.from.id);
        if (!getban.status) return this.bot.sendMessage(this.body.message.chat.id, `You have been banned\n\nReason : ${getban.reason}\n\nDo you want to be able to use bots again? Please contact the owner to request removal of the ban\nOwner : ${constants.OWNER}`)
        let userId = this.body.message.from.id.toString();
        if (userLocks[userId]) {
          return;
        }
        userLocks[userId] = true;
        try {
          await this.bot.sendMessage(process.env.OWNER_ID, `[ Usage Log ]\n◇ FIRST NAME : ${this.body.message.from.first_name ? this.body.message.from.first_name : "-"}\n◇ LAST NAME : ${this.body.message.from.last_name ? this.body.message.from.last_name : "-"}\n◇ USERNAME : ${this.body.message.from.username ? "@" + this.body.message.from.username : "-"}\n◇ ID : ${this.body.message.from.id}\n\nContent: ${this.text.slice(0, 1000)}`, { disable_web_page_preview: true })
          let IG = new Instagram;
          await IG.downloadInstagram(this.bot, this.body.message.chat.id, this.text, this.body.message.from.username ? this.body.message.from.username : '');
        } finally {
          userLocks[userId] = false;
        }
      } else if (constants.COMMAND_PINTEREST_REGEX.test(this.text)) {
        let getban = await Func.getBanned(this.body.message.from.id);
        if (!getban.status) return this.bot.sendMessage(this.body.message.chat.id, `You have been banned\n\nReason : ${getban.reason}\n\nDo you want to be able to use bots again? Please contact the owner to request removal of the ban\nOwner : ${constants.OWNER}`)
        let userId = this.body.message.from.id.toString();
        if (userLocks[userId]) {
          return;
        }
        userLocks[userId] = true;
        try {
          await this.bot.sendMessage(process.env.OWNER_ID, `[ Usage Log ]\n◇ FIRST NAME : ${this.body.message.from.first_name ? this.body.message.from.first_name : "-"}\n◇ LAST NAME : ${this.body.message.from.last_name ? this.body.message.from.last_name : "-"}\n◇ USERNAME : ${this.body.message.from.username ? "@" + this.body.message.from.username : "-"}\n◇ ID : ${this.body.message.from.id}\n\nContent: ${this.text.slice(0, 1000)}`, { disable_web_page_preview: true })
          let Pin = new Pinterest;
          await Pinterest.pinterest(this.bot, this.body.message.chat.id, this.text, this.body.message.from.username ? this.body.message.from.username : '');
        } finally {
          userLocks[userId] = false;
        }
      } else if (constants.COMMAND_SPOTIFY_TRACK_REGEX.test(this.text)) {
        let getban = await Func.getBanned(this.body.message.from.id);
        if (!getban.status) return this.bot.sendMessage(this.body.message.chat.id, `You have been banned\n\nReason : ${getban.reason}\n\nDo you want to be able to use bots again? Please contact the owner to request removal of the ban\nOwner : ${constants.OWNER}`)
        let userId = this.body.message.from.id.toString();
        if (userLocks[userId]) {
          return;
        }
        userLocks[userId] = true;
        try {
          await this.bot.sendMessage(process.env.OWNER_ID, `[ Usage Log ]\n◇ FIRST NAME : ${this.body.message.from.first_name ? this.body.message.from.first_name : "-"}\n◇ LAST NAME : ${this.body.message.from.last_name ? this.body.message.from.last_name : "-"}\n◇ USERNAME : ${this.body.message.from.username ? "@" + this.body.message.from.username : "-"}\n◇ ID : ${this.body.message.from.id}\n\nContent: ${this.text.slice(0, 1000)}`, { disable_web_page_preview: true })
          let Spot = new Spotify;
          return Spot.getSpotifySong(this.bot, this.body.message.chat.id, this.text, this.body.message.from.username ? this.body.message.from.username : '')
        } finally {
          userLocks[userId] = false;
        }
      } else if (constants.COMMAND_SPOTIFY_ALBUM_REGEX.test(this.text)) {
        let getban = await Func.getBanned(this.body.message.from.id);
        if (!getban.status) return this.bot.sendMessage(this.body.message.chat.id, `You have been banned\n\nReason : ${getban.reason}\n\nDo you want to be able to use bots again? Please contact the owner to request removal of the ban\nOwner : ${constants.OWNER}`)
        let userId = this.body.message.from.id.toString();
        if (userLocks[userId]) {
          return;
        }
        userLocks[userId] = true;
        try {
          await this.bot.sendMessage(process.env.OWNER_ID, `[ Usage Log ]\n◇ FIRST NAME : ${this.body.message.from.first_name ? this.body.message.from.first_name : "-"}\n◇ LAST NAME : ${this.body.message.from.last_name ? this.body.message.from.last_name : "-"}\n◇ USERNAME : ${this.body.message.from.username ? "@" + this.body.message.from.username : "-"}\n◇ ID : ${this.body.message.from.id}\n\nContent: ${this.text.slice(0, 1000)}`, { disable_web_page_preview: true })
          let Spot = new Spotify;
          await Spot.getAlbumsSpotify(this.bot, this.body.message.chat.id, this.text, this.body.message.from.username ? this.body.message.from.username : '')
        } finally {
          userLocks[userId] = false;
        }
      } else if (constants.COMMAND_SPOTIFY_PLAYLIST_REGEX.test(this.text)) {
        let getban = await Func.getBanned(this.body.message.from.id);
        if (!getban.status) return this.bot.sendMessage(this.body.message.chat.id, `You have been banned\n\nReason : ${getban.reason}\n\nDo you want to be able to use bots again? Please contact the owner to request removal of the ban\nOwner : ${constants.OWNER}`)
        let userId = this.body.message.from.id.toString();
        if (userLocks[userId]) {
          return;
        }
        userLocks[userId] = true;
        try {
          await this.bot.sendMessage(process.env.OWNER_ID, `[ Usage Log ]\n◇ FIRST NAME : ${this.body.message.from.first_name ? this.body.message.from.first_name : "-"}\n◇ LAST NAME : ${this.body.message.from.last_name ? this.body.message.from.last_name : "-"}\n◇ USERNAME : ${this.body.message.from.username ? "@" + this.body.message.from.username : "-"}\n◇ ID : ${this.body.message.from.id}\n\nContent: ${this.text.slice(0, 1000)}`, { disable_web_page_preview: true })
          let Spot = new Spotify;
          await Spot.getPlaylistSpotify(this.bot, this.body.message.chat.id, this.text, this.body.message.from.username ? this.body.message.from.username : '')
        } finally {
          userLocks[userId] = false;
        }
      } else if (constants.COMMAND_YOUTUBE_REGEX.test(this.text)) {
        let getban = await Func.getBanned(this.body.message.from.id);
        if (!getban.status) return this.bot.sendMessage(this.body.message.chat.id, `You have been banned\n\nReason : ${getban.reason}\n\nDo you want to be able to use bots again? Please contact the owner to request removal of the ban\nOwner : ${constants.OWNER}`)
        let userId = this.body.message.from.id.toString();
        if (userLocks[userId]) {
          return;
        }
        userLocks[userId] = true;
        try {
          if (this.text.includes("/live/")) return this.bot.sendMessage(this.body.message.chat.id, `Cannot download livestream video`)
          await this.bot.sendMessage(process.env.OWNER_ID, `[ Usage Log ]\n◇ FIRST NAME : ${this.body.message.from.first_name ? this.body.message.from.first_name : "-"}\n◇ LAST NAME : ${this.body.message.from.last_name ? this.body.message.from.last_name : "-"}\n◇ USERNAME : ${this.body.message.from.username ? "@" + this.body.message.from.username : "-"}\n◇ ID : ${this.body.message.from.id}\n\nContent: ${this.text.slice(0, 1000)}`, { disable_web_page_preview: true })
          let YT = new Youtube;
          await YT.getYoutube(this.bot, this.body.message.chat.id, this.text, this.body.message.from.username ? this.body.message.from.username : '')
        } finally {
          userLocks[userId] = false;
        }
      } else if (constants.COMMAND_FACEBOOK_REGEX.test(this.text)) {
        let getban = await Func.getBanned(this.body.message.from.id);
        if (!getban.status) return this.bot.sendMessage(this.body.message.chat.id, `You have been banned\n\nReason : ${getban.reason}\n\nDo you want to be able to use bots again? Please contact the owner to request removal of the ban\nOwner : ${constants.OWNER}`)
        let userId = this.body.message.from.id.toString();
        if (userLocks[userId]) {
          return;
        }
        userLocks[userId] = true;
        try {
          await this.bot.sendMessage(process.env.OWNER_ID, `[ Usage Log ]\n◇ FIRST NAME : ${this.body.message.from.first_name ? this.body.message.from.first_name : "-"}\n◇ LAST NAME : ${this.body.message.from.last_name ? this.body.message.from.last_name : "-"}\n◇ USERNAME : ${this.body.message.from.username ? "@" + this.body.message.from.username : "-"}\n◇ ID : ${this.body.message.from.id}\n\nContent: ${this.text.slice(0, 1000)}`, { disable_web_page_preview: true })
          let Faceebook = new FB;
          await Faceebook.getFacebook(this.bot, this.body.message.chat.id, this.text, this.body.message.from.username ? this.body.message.from.username : '')
        } finally {
          userLocks[userId] = false;
        }
      } else if (constants.COMMAND_THREADS_REGEX.test(this.text)) {
        let getban = await Func.getBanned(this.body.message.from.id);
        if (!getban.status) return this.bot.sendMessage(this.body.message.chat.id, `You have been banned\n\nReason : ${getban.reason}\n\nDo you want to be able to use bots again? Please contact the owner to request removal of the ban\nOwner : ${constants.OWNER}`)
        let userId = this.body.message.from.id.toString();
        if (userLocks[userId]) {
          return;
        }
        userLocks[userId] = true;
        try {
          await this.bot.sendMessage(process.env.OWNER_ID, `[ Usage Log ]\n◇ FIRST NAME : ${this.body.message.from.first_name ? this.body.message.from.first_name : "-"}\n◇ LAST NAME : ${this.body.message.from.last_name ? this.body.message.from.last_name : "-"}\n◇ USERNAME : ${this.body.message.from.username ? "@" + this.body.message.from.username : "-"}\n◇ ID : ${this.body.message.from.id}\n\nContent: ${this.text.slice(0, 1000)}`, { disable_web_page_preview: true })
          let Th = new Threads;
          await Th.threadsDownload(this.bot, this.body.message.chat.id, this.text, this.body.message.from.username ? this.body.message.from.username : '')
        } finally {
          userLocks[userId] = false;
        }
      } else if (constants.COMMAND_GITHUB_REGEX.test(this.text)) {
        let getban = await Func.getBanned(this.body.message.from.id);
        if (!getban.status) return this.bot.sendMessage(this.body.message.chat.id, `You have been banned\n\nReason : ${getban.reason}\n\nDo you want to be able to use bots again? Please contact the owner to request removal of the ban\nOwner : ${constants.OWNER}`)
        let userId = this.body.message.from.id.toString();
        if (userLocks[userId]) {
          return;
        }
        userLocks[userId] = true;
        try {
          await this.bot.sendMessage(process.env.OWNER_ID, `[ Usage Log ]\n◇ FIRST NAME : ${this.body.message.from.first_name ? this.body.message.from.first_name : "-"}\n◇ LAST NAME : ${this.body.message.from.last_name ? this.body.message.from.last_name : "-"}\n◇ USERNAME : ${this.body.message.from.username ? "@" + this.body.message.from.username : "-"}\n◇ ID : ${this.body.message.from.id}\n\nContent: ${this.text.slice(0, 1000)}`, { disable_web_page_preview: true })
          let Git = new Github;
          await Git.Clone(this.bot, this.body.message.chat.id, this.text, this.body.message.from.username ? this.body.message.from.username : '')
        } finally {
          userLocks[userId] = false;
        }
      } else if (!this.text && this.body.callback_query.data.startsWith('tta')) {
        let data = this.body.callback_query.data;
        let url = data.split(' ').slice(1).join(' ');
        let chatid = this.body.callback_query.message.chat.id;
        let msgid = this.body.callback_query.message.message_id;
        let usrnm = this.body.callback_query.message.chat.username;
        await this.bot.deleteMessage(chatid, msgid);
        let TT = new Tiktok;
        await TT.tiktokAudio(this.bot, chatid, url, usrnm);
      } else if (!this.text && this.body.callback_query.data.startsWith('ttv')) {
        let data = this.body.callback_query.data;
        let url = data.split(' ').slice(1).join(' ');
        let chatid = this.body.callback_query.message.chat.id;
        let msgid = this.body.callback_query.message.message_id;
        let usrnm = this.body.callback_query.message.chat.username;
        await this.bot.deleteMessage(chatid, msgid);
        let TT = new Tiktok;
        await TT.tiktokVideo(this.bot, chatid, url, usrnm);
      } else if (!this.text && this.body.callback_query.data.startsWith('tts')) {
        let data = this.body.callback_query.data;
        let url = data.split(' ').slice(1).join(' ');
        let chatid = this.body.callback_query.message.chat.id;
        let msgid = this.body.callback_query.message.message_id;
        let usrnm = this.body.callback_query.message.chat.username;
        await this.bot.deleteMessage(chatid, msgid);
        let TT = new Tiktok;
        await TT.tiktokSound(this.bot, chatid, url, usrnm);
      } else if (!this.text && this.body.callback_query.data.startsWith('twh')) {
        let data = this.body.callback_query.data;
        let url = data.split(' ').slice(1).join(' ');
        let chatid = this.body.callback_query.message.chat.id;
        let msgid = this.body.callback_query.message.message_id;
        let usrnm = this.body.callback_query.message.chat.username;
        await this.bot.deleteMessage(chatid, msgid);
        let XDL = new X;
        await XDL.downloadxHigh(this.bot, chatid, usrnm);
      } else if (!this.text && this.body.callback_query.data.startsWith('twl')) {
        let data = this.body.callback_query.data;
        let url = data.split(' ').slice(1).join(' ');
        let chatid = this.body.callback_query.message.chat.id;
        let msgid = this.body.callback_query.message.message_id;
        let usrnm = this.body.callback_query.message.chat.username;
        await this.bot.deleteMessage(chatid, msgid);
        let XDL = new X;
        await XDL.downloadxLow(this.bot, chatid, usrnm);
      } else if (!this.text && this.body.callback_query.data.startsWith('twa')) {
        let data = this.body.callback_query.data;
        let url = data.split(' ').slice(1).join(' ');
        let chatid = this.body.callback_query.message.chat.id;
        let msgid = this.body.callback_query.message.message_id;
        let usrnm = this.body.callback_query.message.chat.username;
        await this.bot.deleteMessage(chatid, msgid);
        let XDL = new X;
        await XDL.downloadxAudio(this.bot, chatid, usrnm);
      } else if (!this.text && this.body.callback_query.data.startsWith('spt')) {
        let data = this.body.callback_query.data;
        let url = data.split(' ').slice(1).join(' ');
        let chatid = this.body.callback_query.message.chat.id;
        let msgid = this.body.callback_query.message.message_id;
        let usrnm = this.body.callback_query.message.chat.username;
        await this.bot.deleteMessage(chatid, msgid);
        let Spot = new Spotify;
        await Spot.getSpotifySong(this.bot, chatid, url, usrnm);
      } else if (!this.text && this.body.callback_query.data.startsWith('fbn')) {
        let data = this.body.callback_query.data;
        let url = data.split(' ').slice(1).join(' ');
        let chatid = this.body.callback_query.message.chat.id;
        let msgid = this.body.callback_query.message.message_id;
        let usrnm = this.body.callback_query.message.chat.username;
        await this.bot.deleteMessage(chatid, msgid);
        let Febe = new FB;
        await Febe.getFacebookNormal(this.bot, chatid, usrnm);
      } else if (!this.text && this.body.callback_query.data.startsWith('fbh')) {
        let data = this.body.callback_query.data;
        let url = data.split(' ').slice(1).join(' ');
        let chatid = this.body.callback_query.message.chat.id;
        let msgid = this.body.callback_query.message.message_id;
        let usrnm = this.body.callback_query.message.chat.username;
        await this.bot.deleteMessage(chatid, msgid);
        let Febe = new FB;
        await Febe.getFacebookHD(this.bot, chatid, usrnm);
      } else if (!this.text && this.body.callback_query.data.startsWith('fba')) {
        let data = this.body.callback_query.data;
        let url = data.split(' ').slice(1).join(' ');
        let chatid = this.body.callback_query.message.chat.id;
        let msgid = this.body.callback_query.message.message_id;
        let usrnm = this.body.callback_query.message.chat.username;
        await this.bot.deleteMessage(chatid, msgid);
        let Febe = new FB;
        await Febe.getFacebookAudio(this.bot, chatid, usrnm);
      } else if (!this.text && this.body.callback_query.data.startsWith('ytv')) {
        let data = this.body.callback_query.data;
        let url = data.split(' ').slice(1).join(' ');
        let args = url.split(' ');
        let chatid = this.body.callback_query.message.chat.id;
        let msgid = this.body.callback_query.message.message_id;
        let usrnm = this.body.callback_query.message.chat.username;
        await this.bot.deleteMessage(chatid, msgid);
        let Yt = new Youtube;
        await Yt.getYoutubeVideo(this.bot, chatid, args[0], args[1], usrnm);
      } else if (!this.text && this.body.callback_query.data.startsWith('yta')) {
        let data = this.body.callback_query.data;
        let url = data.split(' ').slice(1).join(' ');
        let args = url.split(' ');
        let chatid = this.body.callback_query.message.chat.id;
        let msgid = this.body.callback_query.message.message_id;
        let usrnm = this.body.callback_query.message.chat.username;
        await this.bot.deleteMessage(chatid, msgid);
        let Yt = new Youtube;
        await Yt.getYoutubeAudio(this.bot, chatid, args[0], args[1], usrnm);
      }
    } catch (error) {
      this.bot.sendMessage(process.env.OWNER_ID, `Error: ${error}`)
      console.error(error);
    }
  }
}

module.exports = BotController;
