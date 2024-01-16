const axios = require('axios');
const fs = require('fs');
const util = require('util');
const Funcs = require('../controllers/Functions');
const Func = new Funcs;
const { Y2MateClient } = require('y2mate-api');
const client = new Y2MateClient();

class Youtube {
  async getYoutube(bot, chatId, url, userName) {
    let load = await bot.sendMessage(chatId, 'Loading, please wait.');
    let data = [];
    try {
      if (url.includes('music.youtube.com')) {
        let newUrl = url.replace('music.youtube.com', 'www.youtube.com');
        let get = await client.getFromURL(newUrl, 'vi');
        let getsize = get.linksAudio.get('mp3128' ? 'mp3128' : '140').size
        let size = Math.floor(getsize.replace(' MB', ''))
        if (size > 49) {
          return bot.editMessageText('The file size is more than 50 MB, bots can only download under 50 MB.', { chat_id: chatId, message_id: load.message_id })
        }
        let fname = Func.filterAlphanumericWithDash(get.title) + '.mp3';
        let get2 = await get.linksAudio.get('mp3128' ? 'mp3128' : '140').fetch();
        await bot.editMessageText(`Downloading music ${get.title}, please wait.`, { chat_id: chatId, message_id: load.message_id })
        let buff = await Func.getBuffer(get2.downloadLink);
        await fs.writeFileSync('/tmp/'+fname, buff);
        await bot.sendAudio(chatId, '/tmp/'+fname, { caption: 'Successful music download ' + get.title })
        await bot.deleteMessage(chatId, load.message_id);
        await fs.unlinkSync('/tmp/'+fname)
      } else {
        let data = [];
        let get = await client.getFromURL(url, 'vi');
        for (let [ind, args] of get.linksVideo) {
          let title = Func.htmlToText(args.name);
          data.push([{ text: `Video ${title}${args.size ? ' - ' + args.size : ''}`, callback_data: `ytv ${get.videoId} ${ind}`}])
        }
        for (let [ind, args] of get.linksAudio) {
          let title = Func.htmlToText(args.name);
          data.push([{ text: `Audio ${title}${args.size ? ' - ' + args.size : ''}`, callback_data: `yta ${get.videoId} ${ind}`}])
        }
        let options = {
          caption: `${get.title}\n\nPlease select the following option!`,
          reply_markup: JSON.stringify({
            inline_keyboard: data
          })
        }
        await bot.sendPhoto(chatId, `https://i.ytimg.com/vi/${get.videoId}/0.jpg`, options)
        await bot.deleteMessage(chatId, load.message_id);
      }
    } catch (err) {
      await bot.sendMessage(process.env.OWNER_ID, `[ ERROR MESSAGE ]\n\n• Username: ${userName ? "@"+userName : '-'}\n• Function: getYoutube()\n• Url: ${url}\n\n${err}`.trim());
      return bot.editMessageText('An error occurred, make sure your YouTube link is valid!', { chat_id: chatId, message_id: load.message_id })
    }
  }
  
  async getYoutubeVideo(bot, chatId, id, ind, userName) {
    let load = await bot.sendMessage(chatId, 'Loading, please wait.')
    try {
      let get = await client.getFromURL('https://www.youtube.com/'+id, 'vi');
      let res = await get.linksVideo.get(ind).fetch();
      let getsize = get.linksVideo.get(ind).size;
      let size = Math.floor(getsize.replace(' MB', ''));
      if (size > 49) {
        return bot.editMessageText('file size is more than 50mb, the bot can only download files under 50mb, please download it in your browser using the following link\n\n' + res.downloadLink, { chat_id: chatId, message_id: load.message_id, disable_web_page_preview: true })
      }
      let fname = Func.filterAlphanumericWithDash(res.title) + '.mp4';
      await bot.editMessageText('Loading, downloading video ' + get.title, { chat_id: chatId, message_id: load.message_id });
      let buff = await Func.getBuffer(res.downloadLink);
      await fs.writeFileSync('/tmp/'+fname, buff);
      await bot.sendVideo(chatId, '/tmp/'+fname, { caption: res.title });
      //await bot.deleteMessage(chatId, load.message_id);
      await fs.unlinkSync('/tmp/'+fname);
    } catch (err) {
      await bot.sendMessage(process.env.OWNER_ID, `[ ERROR MESSAGE ]\n\n• Username: ${userName ? "@"+userName : '-'}\n• Function: getYoutubeVideo()\n• Url: https://www.youtube.com/${id}\n\n${err}`.trim());
      await bot.editMessageText('An error occurred, failed to download video!', { chat_id: chatId, message_id: load.message_id })
    }
  }
  
  async getYoutubeAudio(bot, chatId, id, ind, userName) {
    let load = await bot.sendMessage(chatId, 'Loading, please wait.')
    try {
      let get = await client.getFromURL('https://www.youtube.com/'+id, 'vi');
      let res = await get.linksAudio.get(ind).fetch();
      let getsize = get.linksAudio.get(ind).size;
      let size = Math.floor(getsize.replace(' MB', ''));
      if (size > 49) {
        return bot.editMessageText('file size is more than 50mb, the bot can only download files under 50mb, please download it in your browser using the following link\n\n' + res.downloadLink, { chat_id: chatId, message_id: load.message_id, disable_web_page_preview: true })
      }
      let fname = Func.filterAlphanumericWithDash(res.title) + '.mp3';
      await bot.editMessageText('Loading, downloading audio ' + get.title, { chat_id: chatId, message_id: load.message_id });
      let buff = await Func.getBuffer(res.downloadLink);
      await fs.writeFileSync('/tmp/'+fname, buff);
      await bot.sendAudio(chatId, '/tmp/'+fname, { caption: res.title });
      //await bot.deleteMessage(chatId, load.message_id);
      await fs.unlinkSync('/tmp/'+fname);
    } catch (err) {
      await bot.sendMessage(process.env.OWNER_ID, `[ ERROR MESSAGE ]\n\n• Username: ${userName ? "@"+userName : '-'}\n• Function: getYoutubeAudio()\n• Url: https://www.youtube.com/${id}\n\n${err}`.trim());
      await bot.editMessageText('An error occurred, failed to download audio!', { chat_id: chatId, message_id: load.message_id })
    }
  }
}

module.exports = Youtube