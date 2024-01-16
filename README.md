# FileFetcher Bot
Serverless Telegram bot for Downloader Social Media, Developer Features, and Other features.

<p align="center">
  <img src="assets/imgs/filefetcher-bot.jpg">
</p>

# Downloader List
Directly send the link to the bot, without using commands
* Youtube - Video / Audio
* Tiktok - Video / Audio / Music / Photo
* Twitter / X - Video / Audio
* Spotify - Audio
* Instagram - Reels / Post / Story
* Threads - Video / Photo
* Pinterest - Video / Photo
* Github - Git Clone

# Developer Features
* /bcrypt `text` - Text to bcrypt hash
* /binary `text` - Text to binary
* /hex `text` - HEX to ASCII
* /md5 `text` - Text to MD5 hash
* /short `url` - Short url
* /slug `text` - Slug text
* /uuid - Generate UUID
* /help - Help

# Other Features
* /ai `text` - AI uses GPT
* /brainly `text` - Search Questions ( id )
* /pin `text` - Search image on Pinterest
* /google `text` - Search on Google


# Prerequisites
* [Node.js](https://nodejs.org/en/)

# Running
### 1. Telegram
````
# Create an Telegram bot
Find @BotFather on Telegram, type /newbot and follow the instructions.

# Credentials
Save your token from @BotFather.

# Chat Bots [Get Id](https://t.me/getidsbot)
Type start then save your ID (OWNER_ID)

````

### 2. Vercel Deploy
````
# Account
Create an Vercel account on https://vercel.com/.

# Install Vercel CLI
npm install -g vercel

# Vercel CLI login
vercel login

# Deploy
vercel

# Set Vercel environment variables
OWNER_ID
TELEGRAM_TOKEN
````

### 3. Setting up the Telegram webhook
````
curl --location --request POST https://api.telegram.org/bot<YOUR-TELEGRAM-TOKEN>/setWebhook --header 'Content-type: application/json' --data '{"url": "https://project-name.username.vercel.app/api/webhook"}'
````

# Built With
* [Node.js](https://nodejs.org/en/)

# Base
* [xxgicoxx](https://github.com/xxgicoxx/devtools-bot)