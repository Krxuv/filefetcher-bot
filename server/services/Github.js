let fs = require('fs')
let Funcs = require('../controllers/Functions');
let Func = new Funcs;
let regex = /(?:https|git)(?::\/\/|@)github\.com[\/:]([^\/:]+)\/(.+)/i
class Github {
  async Clone(bot, chatId, link, username) {
     let load = await bot.sendMessage(chatId, `Loading, please wait`);
     let [_, user, repo] = (link || '').match(regex) || []
     repo = repo.replace(/.git$/, '')
     let url = `https://api.github.com/repos/${user}/${repo}/zipball`
     let getbuff = await Func.getBuffer(url);
     let filename = (await fetch(url, { method: 'HEAD' })).headers.get('content-disposition').match(/attachment; filename=(.*)/)[1];
     await fs.writeFileSync(`/tmp/${filename}`, getbuff);
     try {
     	await bot.sendDocument(chatId, `/tmp/${filename}`, { caption: `Success Download Github\nRepo: ${link}`, disable_web_page_preview: true })
     	await fs.unlinkSync(`/tmp/${filename}`);
     	return bot.deleteMessage(chatId, load.message_id)
  	} catch (err) {
  	   await bot.sendMessage(process.env.OWNER_ID, `[ ERROR MESSAGE ]\n\n• Username: ${userName ? "@"+userName : '-'}\n• Function: gitClone()\n• Url: ${link}\n\n${err}`.trim(), { disable_web_page_preview: true });
  	   return bot.editMessageText(`Failed to download file\nPlease download it yourself in your browser using the following link\n${url}`, { chat_id: chatId, message_id: load.message_id, disable_web_page_preview: true })
  	}
  }
}

module.exports = Github