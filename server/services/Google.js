const { search } = require('google-sr');

class Google {
  async googleSearch(bot, chatId, query, userName) {
    if (!query) return bot.sendMessage(chatId, `Send your Google search query, example\n/google what is javascript`)
    bot.sendChatAction(chatId, 'typing');
    try {
      const searchResults = await search({ query: query });
      let resultS = `GOOGLE SEARCH\n\n`
      for (let i = 0;i < 5;i++) {
        resultS += `• Title: ${searchResults[i].title}\n• Link: ${searchResults[i].link}\n• Description: ${searchResults[i].description}\n\n`
      };
      return bot.sendMessage(chatId, resultS);
    } catch (err) {
      await bot.sendMessage(process.env.OWNER_ID, `[ ERROR MESSAGE ]\n\n• Username: ${userName ? "@"+userName : '-'}\n• Function: googleSearch()\n• Input: ${query}\n\n${err}`.trim());
      return bot.sendMessage(chatId, 'An error occurred!');
    }
  }
}

module.exports = Google