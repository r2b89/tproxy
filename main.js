const { Telegraf } = require('telegraf')
const puppeteer = require("puppeteer");
require('dotenv').config()
fs = require('fs');

const bot = new Telegraf(process.env.BOT_TOKEN)

function greetMessage(ctx) {
    ctx.reply('Welcome in proxyfier')
}

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
  }

const capture = async (ctx, userId, url) => {
    console.log(url)
    var procesedUrl = !(url.includes("http://") && url.includes("https://")) ? `https://${url}` :url
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setRequestInterception(true)

    page.on('request', (request) => {
      if (request.url().includes('.js'))
        console.log('>>', request.method(), request.url())
      request.continue()
    })
    // var scripts = {}
    page.on('response', async (response) => {
      console.log('<<', response.status(), response.url())
      if (response.url().includes('.js')) {
        console.log('<<JS<<', response.status(), response.url())
        try {
        const text = await response.text();
        ctx.reply(response.url())
        // scripts[response.url()] = text
        } catch (err) {
          console.error(`Failed getting data from: ${url}`);
      console.error(err);
        }
      }
    })
    await page.goto(procesedUrl);
    await page.screenshot({ path: "./" + userId + ".png"});
    await page.close();
    await browser.close();
  };

bot.command('start', ctx => {
    greetMessage(ctx)
})

bot.command('help', ctx => {
    ctx.reply('Send URL for test remotely')
})


bot.command('test', async (ctx) => {
    const commandArray = ctx.update.message.text.split(' ')
    if (commandArray.length !== 2 )
        ctx.reply('ERROR: Incorrect input!')

    const userId = ctx.message.chat.id
    await capture(ctx, userId, commandArray[1])
    await delay(3000)
  })

bot.launch()