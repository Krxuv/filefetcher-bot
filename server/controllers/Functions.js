const axios = require('axios');
const cheerio = require('cheerio');

class Funcs {
  async getRandom(ext) {
    return `${Math.floor(Math.random() * 10000)}${ext}`
  }

  async getBuffer(url) {
    try {
      let data = await axios({
        method: 'get',
        url,
        headers: {
          'DNT': 1,
          'Upgrade-Insecure-Requests': 1,
          'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36'
        },
        responseType: 'arraybuffer'
      })
      return data.data
    } catch (err) {
      console.log(err);
      return err
    }
  }

  async getBanned(user) {
    try {
      let get = await axios.get(`https://raw.githubusercontent.com/Krxuv/list_banned/main/banned.json`)
      let json = get.data;
      let idget = json.find(item => item.id == user);
      if (idget) {
        return {
          status: false,
          reason: idget.reason
        }
      } else {
        return {
          status: true
        }
      }
    } catch (err) {
      console.log(err)
      return {
        status: true
      }
    }
  }

  filterAlphanumericWithDash(inputText) {
    return inputText.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '-');
  }

  htmlToText(html) {
    let $ = cheerio.load(html);
    return $.text();
  }
}


module.exports = Funcs