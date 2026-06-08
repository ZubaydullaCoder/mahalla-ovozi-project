import { Bot } from 'grammy'
import { env } from '../shared/env.js'
import { logger } from '../shared/logger.js'
import { pipeline } from './filters/pipeline.js'

export const bot = new Bot(env.BOT_TOKEN)

bot.on('message', async (ctx) => {
  await pipeline(ctx.update)
})

bot.on('edited_message', async (ctx) => {
  logger.info(
    {
      updateId:  ctx.update.update_id,
      chatId:    ctx.update.edited_message?.chat.id.toString(),
      messageId: ctx.update.edited_message?.message_id,
    },
    'Pre-filter discard: edited_message ignored',
  )
})
