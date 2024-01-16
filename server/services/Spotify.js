const axios = require('axios');
const { parse } = require('spotify-uri');
const util = require('util');
const Funcs = require('../controllers/Functions');
const Func = new Funcs
const fs = require('fs');

/*
** Endpoints **
https://api.spotifydown.com

* Download Song
/download/

* Metadata Playlist
/metadata/playlist/

* Track Playlist
/trackList/playlist/

*/
class Spotify {
  async spotifyScraper(id, endpoint) {
    try {
      let { data } = await axios.get(`https://api.spotifydown.com/${endpoint}/${id}`, {
        headers: {
          'Origin': 'https://spotifydown.com',
          'Referer': 'https://spotifydown.com/',
        }
      })
      return data
    } catch (err) {
      return 'Error: ' + err
    }
  }
  
  async getPlaylistSpotify(bot, chatId, url, userName) {
    let pars = await parse(url);
    let load = await bot.sendMessage(chatId, 'Loading, please wait.')
    try {
      let getdata = await this.spotifyScraper(`${pars.id}`, 'trackList/playlist')
      let data = [];
      getdata.trackList.map(maru => {
        data.push([{ text: `${maru.title} - ${maru.artists}`, callback_data: 'spt ' + maru.id }])
      })
      let options = {
        caption: 'Please select the music you want to download by pressing one of the buttons below!',
        reply_markup: JSON.stringify({
          inline_keyboard: data
        })
      };
      await bot.sendPhoto(chatId, 'https://telegra.ph/file/a41e47f544ed99dd33783.jpg', options);
      await bot.deleteMessage(chatId, load.message_id);
    } catch (err) {
      await bot.sendMessage(process.env.OWNER_ID, `[ ERROR MESSAGE ]\n\n• Username: ${userName ? "@"+userName : '-'}\n• Function: getPlaylistSpotify()\n• Url: ${url}\n\n${err}`.trim());
      return bot.editMessageText('Error getting playlist data!', { chat_id: chatId, message_id: load.message_id })
    }
  }
  
  async getAlbumsSpotify(bot, chatId, url, userName) {
    let pars = await parse(url);
    let load = await bot.sendMessage(chatId, 'Loading, please wait.')
    try {
      let getdata = await this.spotifyScraper(`${pars.id}`, 'trackList/album')
      let data = [];
      getdata.trackList.map(maru => {
        data.push([{ text: `${maru.title} - ${maru.artists}`, callback_data: 'spt ' + maru.id }])
      })
      let options = {
        caption: 'Please select the music you want to download by pressing one of the buttons below!',
        reply_markup: JSON.stringify({
          inline_keyboard: data
        })
      };
      await bot.sendPhoto(chatId, 'https://telegra.ph/file/a41e47f544ed99dd33783.jpg', options);
      await bot.deleteMessage(chatId, load.message_id);
    } catch (err) {
      await bot.sendMessage(process.env.OWNER_ID, `[ ERROR MESSAGE ]\n\n• Username: ${userName ? "@"+userName : '-'}\n• Function: getAlbumsSpotify()\n• Url: ${url}\n\n${err}`.trim());
      return bot.editMessageText('Error getting playlist data!', { chat_id: chatId, message_id: load.message_id })
    }
  }
  
  async getSpotifySong(bot, chatId, url, userName) {
    let load = await bot.sendMessage(chatId, 'Loading, please wait.')
    try {
      if (url.includes('spotify.com')) {
        let pars = await parse(url);
        let getdata = await this.spotifyScraper(pars.id, 'download');
        let fname = `${Func.filterAlphanumericWithDash(getdata.metadata.title)}-${Func.filterAlphanumericWithDash(getdata.metadata.artists)}_${chatId}.mp3`
        if (getdata.success) {
          await bot.editMessageText(`Downloading song ${getdata.metadata.title} - ${getdata.metadata.artists}, please wait...`, { chat_id: chatId, message_id: load.message_id })
          let buff = await Func.getBuffer(getdata.link);
          await fs.writeFileSync('/tmp/'+fname, buff);
          await bot.sendAudio(chatId, '/tmp/'+fname, { caption: `Success download song ${getdata.metadata.title} - ${getdata.metadata.artists}`});
          await bot.deleteMessage(chatId, load.message_id);
          await fs.unlinkSync('/tmp/'+fname);
        } else {
          await bot.editMessageText('Error, failed to get data', { chat_id: chatId, message_id: load.message_id })
        }
      } else {
        let getdata = await this.spotifyScraper(url, 'download');
        let fname = `${Func.filterAlphanumericWithDash(getdata.metadata.title)}-${Func.filterAlphanumericWithDash(getdata.metadata.artists)}_${chatId}.mp3`
        if (getdata.success) {
          await bot.editMessageText(`Downloading song ${getdata.metadata.title} - ${getdata.metadata.artists}, please wait...`, { chat_id: chatId, message_id: load.message_id })
          let buff = await Func.getBuffer(getdata.link);
          await fs.writeFileSync('/tmp/'+fname, buff);
          await bot.sendAudio(chatId, '/tmp/'+fname, { caption: `Success download song ${getdata.metadata.title} - ${getdata.metadata.artists}`});
          await bot.deleteMessage(chatId, load.message_id);
          await fs.unlinkSync('/tmp/'+fname);
        } else {
          await bot.editMessageText('Error, failed to get data', { chat_id: chatId, message_id: load.message_id })
        }
      }
    } catch (err) {
      await bot.sendMessage(process.env.OWNER_ID, `[ ERROR MESSAGE ]\n\n• Username: ${userName ? "@"+userName : '-'}\n• Function: getSpotifySong()\n• Url: ${url}\n\n${err}`.trim());
      return bot.editMessageText('Failed to download song!', { chat_id: chatId, message_id: load.message_id })
    }
  }
}

module.exports = Spotify