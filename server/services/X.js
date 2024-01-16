const axios = require('axios');
const cheerio = require('cheerio');
const qs = require('qs')
const fs = require('fs')
const util = require('util')
const DB = require('../controllers/Database');
const Databs = new DB;
const Funcs = require('../controllers/Functions');
const Func = new Funcs;

class X {
  x(link){
  	return new Promise((resolve, reject) => {
  		let config = {
  			'URL': link
  		}
      axios.post('https://twdown.net/download.php',qs.stringify(config),{
  			headers: {
  				"user-agent": "Mozilla/5.0 (Linux; U; Android 12; in; SM-A015F Build/SP1A.210812.016.A015FXXS5CWB2) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/110.0.0.0 Mobile Safari/537.36"
  			}
  		})
  		.then(({ data }) => {
  		const $ = cheerio.load(data)
  		resolve({
  				desc: $('div:nth-child(1) > div:nth-child(2) > p').text().trim(),
  				thumb: $('div:nth-child(1) > img').attr('src'),
  				HD: $('tbody > tr:nth-child(1) > td:nth-child(4) > a').attr('href'),
  				SD: $('tr:nth-child(2) > td:nth-child(4) > a').attr('href'),
  				audio: $('body > div.jumbotron > div.container > center > div.row > div.col-md-8.col-md-offset-2 > div.col-md-8.col-md-offset-2 > table.table.table-bordered.table-hover.table-striped > tbody > tr:nth-child(3) > td:nth-child(4) > a').attr('href')
  			})
  		})
  	.catch(reject)
  	})
  }
  
  async xdl2(url) {
    try {
      const result = { status: true, type: "", media: [] }
      const { data } = await axios(`https://savetwitter.net/api/ajaxSearch`, {
        method: "post",
        data: { q: url, lang: "en" },
        headers: {
          accept: "*/*",
          "user-agent": "PostmanRuntime/7.32.2",
          "content-type": "application/x-www-form-urlencoded"
        }
      })
      let $ = cheerio.load(data.data)
      if ($("div.tw-video").length === 0) {
        $("div.video-data > div > ul > li").each(function () {
          result.type = "image"
          result.media.push($(this).find("div > div:nth-child(2) > a").attr("href"))
        })
      } else {
        $("div.tw-video").each(function () {
          result.type = "video"
          result.media.push({
            quality: $(this).find(".tw-right > div > p:nth-child(1) > a").text().split("(")[1].split(")")[0],
            url: $(this).find(".tw-right > div > p:nth-child(1) > a").attr("href")
          })
        })
      }
      return result
    } catch (err) {
      const result = {
        status: false,
        message: "Media not found!" + String(err)
      }
      console.log(result)
      return result
    }
  }
  
  async getDatax(bot, chatId, url, userName) {
    let surl = url.replace('https://twitter.com/', '');
    let load = await bot.sendMessage(chatId, 'Loading, please wait.');
    try {
      let getd = await this.x(url);
      if (!getd.HD && !getd.SD) {
        try {
          let get2 = await this.xdl2(url);
          if (get2.type == 'video') {
            await bot.sendChatAction(chatId, 'upload_video');
            await bot.sendVideo(chatId, get2.media[0].url, { caption: `Bot by @Krxuvv` })
            return bot.deleteMessage(chatId, load.message_id);
          } else if (get2.type == 'image') {
            for (let i = 0;i < get2.media.length;i++) {
              await bot.sendChatAction(chatId, 'upload_photo')
              await bot.sendPhoto(chatId, get2.media[i])
            }
            return bot.deleteMessage(chatId, load.message_id);
          }
        } catch (err) {
          await bot.deleteMessage(chatId, load.message_id);
          return bot.editMessageText('Failed  to get video information, make sure the Twitter / X link is valid and not a photo!', { chat_id: chatId, message_id: load.message_id })
        }
      } else if (getd.HD && getd.thumb) {
        let db = await Databs.readDb('/tmp/database.json');
        db[chatId] = {
          twhd: getd.HD,
          twsd: getd.SD,
          twaud: getd.audio
        };
        await Databs.writeDb(db, '/tmp/database.json');
        let options = {
          caption: `${getd.desc ? getd.desc + '\n\n' : ''}Please select the following option!`,
          reply_markup: JSON.stringify({
            inline_keyboard: [
              [{ text: 'High Quality Videos', callback_data: 'twh' }],
              [{ text: 'Low Quality Videos', callback_data: 'twl' }],
              [{ text: 'Download Audio Only', callback_data: 'twa' }]
            ]
          })
        };
        await bot.sendChatAction(chatId, 'typing')
        await bot.sendPhoto(chatId, getd.thumb, options);
        await bot.deleteMessage(chatId, load.message_id);
      }
    } catch (err) {
      await bot.sendMessage(process.env.OWNER_ID, `[ ERROR MESSAGE ]\n\n• Username: ${userName ? "@"+userName : '-'}\n• Function: getDatax()\n• Url: ${url}\n\n${err}`.trim());
      return bot.editMessageText('An error occurred!', { chat_id: chatId, message_id: load.message_id })
    }
  }
  
  
  async downloadxHigh(bot, chatId, userName) {
    let load = await bot.sendMessage(chatId, 'Loading, please wait.');
    let db = await Databs.readDb('/tmp/database.json');
    try {
      await bot.sendVideo(chatId, db[chatId].twhd, { caption: `Bot by @Krxuvv` });
      await bot.deleteMessage(chatId, load.message_id);
      db[chatId] = {
        twhd: '',
        twsd: '',
        twaud: ''
      };
      await Databs.writeDb(db, '/tmp/database.json');
    } catch (err) {
      await bot.sendMessage(process.env.OWNER_ID, `[ ERROR MESSAGE ]\n\n• Username: ${userName ? "@"+userName : '-'}\n• Function: downloadxHigh()\n\n${err}`.trim());
      await bot.editMessageText('Failed to download the video!\n\nPlease download it yourself in your browser\n' + db[chatId].twhd, { chat_id: chatId, message_id: load.message_id, disable_web_page_preview: true });
      db[chatId] = {
        twhd: '',
        twsd: '',
        twaud: ''
      };
      await Databs.writeDb(db, '/tmp/database.json');
    }
  }
  
  async downloadxLow(bot, chatId, userName) {
    let load = await bot.sendMessage(chatId, 'Loading, please wait.');
    let db = await Databs.readDb('/tmp/database.json');
    try {
      await bot.sendVideo(chatId, db[chatId].twsd, { caption: `Bot by @Krxuvv` });
      await bot.deleteMessage(chatId, load.message_id);
      db[chatId] = {
        twhd: '',
        twsd: '',
        twaud: ''
      };
      await Databs.writeDb(db, '/tmp/database.json');
    } catch (err) {
      await bot.sendMessage(process.env.OWNER_ID, `[ ERROR MESSAGE ]\n\n• Username: ${userName ? "@"+userName : '-'}\n• Function: downloadxLow()\n\n${err}`.trim());
      await bot.editMessageText('Failed to download the video!\n\nPlease download it yourself in your browser\n' + db[chatId].twsd, { chat_id: chatId, message_id: load.message_id, disable_web_page_preview: true });
      db[chatId] = {
        twhd: '',
        twsd: '',
        twaud: ''
      };
      await Databs.writeDb(db, '/tmp/database.json');
    }
  }
  
  async downloadxAudio(bot, chatId, userName) {
    let load = await bot.sendMessage(chatId, 'Loading, please wait.');
    let db = await Databs.readDb('/tmp/database.json');
    try {
      let buff = await Func.getBuffer(db[chatId].twaud)
      await fs.writeFileSync('/tmp/Twitt_audio_' + chatId + '.mp3', buff);
      await bot.sendAudio(chatId, '/tmp/Twitt_audio_' + chatId + '.mp3', { caption: `Bot by @Krxuvv` });
      await bot.deleteMessage(chatId, load.message_id);
      db[chatId] = {
        twhd: '',
        twsd: '',
        twaud: ''
      };
      await Databs.writeDb(db, '/tmp/database.json');
    } catch (err) {
      await bot.sendMessage(process.env.OWNER_ID, `[ ERROR MESSAGE ]\n\n• Username: ${userName ? "@"+userName : '-'}\n• Function: downloadxAudio()\n\n${err}`.trim());
      await bot.editMessageText('Failed to send the audio!\n\nPlease download it yourself in your browser\n' + db[chatId].twaud, { chat_id: chatId, message_id: load.message_id, disable_web_page_preview: true });
      db[chatId] = {
        twhd: '',
        twsd: '',
        twaud: ''
      };
      await Databs.writeDb(db, '/tmp/database.json');
    }
  }
}

module.exports = X