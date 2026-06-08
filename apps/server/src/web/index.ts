import express from 'express'
import morgan from 'morgan'
import { env } from '../shared/env.js'
import { logger } from '../shared/logger.js'
import webhookRouter from '../bot/webhook.js'

const app = express()

app.use(morgan('dev'))
app.use(webhookRouter)
app.use(express.json())

app.listen(env.PORT, () => {
  logger.info({ port: env.PORT }, 'Server started')
})
