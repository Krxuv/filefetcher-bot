const axios = require('axios');
const cheerio = require('cheerio');
const util = require('util');
const fs = require('fs');
const Funcs = require('../controllers/Functions');
const Func = new Funcs;

class Instagram {
  async igdl(url) {
    try {
      let { data } = await axios.get(`https://krxuv-api.vercel.app/api/instagram?apikey=Krxuvonly&url=${url}`);
      return data.results
    } catch (err) {
      return err
    }
  }
  
  async downloadInstagram(bot, chatId, url, userName) {
    let load = await bot.sendMessage(chatId, 'Loading, please wait.')
    try {
      let get = await this.igdl(url);
      if (!get[0]) {
        return bot.editMessageText('Failed to get data, make sure your Instagram link is valid!', { chat_id: chatId, message_id: load.message_id })
      } else if (get[0]) {
        let res = [];
        let res2 = [];
        if (get.length == 1) {
          if (get[0].type == 'Photo') {
            await bot.deleteMessage(chatId, load.message_id)
            return bot.sendPhoto(chatId, get[0].thumbnail, { caption: `Bot by @Krxuvv` })
          } else {
            try {
              await bot.sendVideo(chatId, get[0].url, { caption: `Bot by @Krxuvv` })
            } catch (err) {
              let buff = await Func.getBuffer(get[0].url);
              await fs.writeFileSync('/tmp/vid-ig-single-' + chatId + '.mp4', buff)
              await bot.deleteMessage(chatId, load.message_id)
              await bot.sendVideo(chatId, '/tmp/vid-ig-single-' + chatId + '.mp4', { caption: `Bot by @Krxuvv` })
              await fs.unlinkSync('/tmp/vid-ig-single-' + chatId + '.mp4')
            }
          }
        } else {
          get.forEach(maru => {
            if (maru.type === 'Photo') {
              res.push({ type: 'photo', media: maru.thumbnail })
            } else {
              res2.push({ type: 'video', media: maru.url })
            }
          })
          let currentIndex = 0;
          while (currentIndex < res.length) {
            let mediaToSend = res.slice(currentIndex, currentIndex + 10);
            currentIndex += 10;
  
            if (mediaToSend.length > 0) {
              await bot.sendMediaGroup(chatId, mediaToSend, { caption: `Bot by @Krxuvv` });
            }
          }
  
          res.length = 0;
          res2.map(async (mi) => {
            let nfile = await Func.getRandom('.mp4')
            let buff = await Func.getBuffer(mi.media);
            await fs.writeFileSync('/tmp/' + nfile, buff)
            await bot.sendVideo(chatId, '/tmp/' + nfile, { caption: `Bot by @Krxuvv` })
            await fs.unlinkSync('/tmp/' + nfile)
          })
  
          await bot.deleteMessage(chatId, load.message_id)
        }
      }
    } catch (err) {
      await bot.sendMessage(process.env.OWNER_ID, `[ ERROR MESSAGE ]\n\n• Username: ${userName ? "@"+userName : '-'}\n• Function: downloadInstagram()\n• Url: ${url}\n\n${err}`.trim());
      return bot.editMessageText('An error occurred, make sure your Instagram link is valid!', { chat_id: chatId, message_id: load.message_id })
    }
  }
}

module.exports = Instagram;