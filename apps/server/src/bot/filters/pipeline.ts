import type { Update } from 'grammy/types'
import { logger } from '../../shared/logger.js'
import { prisma } from '../../shared/db.js'

// ─────────────────────────────────────────────────────────────────────────────
// Exported filter predicates — individually testable pure functions
// ─────────────────────────────────────────────────────────────────────────────

/** F0 — returns true when message.from is missing (channel-post forward, etc.) */
export function hasMissingSender(update: Update): boolean {
  return update.message?.from === undefined
}

/** F1 — returns true when the sender is a bot (includes GroupAnonymousBot) */
export function isBot(update: Update): boolean {
  return update.message?.from?.is_bot === true
}

/** F2 — returns true when the message has neither text nor caption */
export function hasNoText(update: Update): boolean {
  return update.message?.text === undefined && update.message?.caption === undefined
}

/**
 * F3 — returns true when the text is trivial and should be discarded.
 * Rules (narrow — NO length threshold):
 *   • starts with '/'  → bot command
 *   • pure emoji       → no \w alphanumeric chars after trim
 *   • empty after trim → whitespace-only
 * Short civic texts like 'gaz?', 'suv?', 'tok?' PASS (they contain \w chars).
 */
export function isTrivialContent(text: string): boolean {
  const trimmed = text.trim()
  if (trimmed === '') return true
  if (trimmed.startsWith('/')) return true
  // Pure emoji: matches only Extended_Pictographic/Emoji_Component/whitespace chars
  // with zero word-character (\w) chars. This correctly allows 'gaz?', '?', etc.
  if (/^[\p{Extended_Pictographic}\p{Emoji_Component}\s]+$/u.test(trimmed) && !/\w/u.test(trimmed)) {
    return true
  }
  return false
}

// ─────────────────────────────────────────────────────────────────────────────
// Main pipeline — only called for 'message' updates
// ─────────────────────────────────────────────────────────────────────────────

export async function pipeline(update: Update): Promise<void> {
  const updateId = update.update_id

  // F0 — missing sender (channel post forwarded into group)
  if (hasMissingSender(update)) {
    logger.warn({ updateId }, 'Pre-filter discard: missing sender (from undefined)')
    return
  }

  const from = update.message!.from!

  // F1 — bot sender (also catches GroupAnonymousBot)
  if (isBot(update)) {
    logger.info(
      { updateId, chatId: update.message!.chat.id.toString(), filter: 'F1' },
      'Pre-filter discard: bot sender',
    )
    return
  }

  // F2 — no text and no caption
  if (hasNoText(update)) {
    logger.info(
      { updateId, chatId: update.message!.chat.id.toString(), filter: 'F2' },
      'Pre-filter discard: no text or caption',
    )
    return
  }

  const rawText = update.message!.text ?? update.message!.caption!
  const text_source: 'text' | 'caption' = update.message!.text !== undefined ? 'text' : 'caption'

  // F3 — trivial content (bot command, pure emoji, empty-after-trim)
  if (isTrivialContent(rawText)) {
    logger.info(
      { updateId, chatId: update.message!.chat.id.toString(), filter: 'F3', text: rawText.slice(0, 50) },
      'Pre-filter discard: trivial content',
    )
    return
  }

  // ── After F0/F1/F2/F3 pass ──

  const chatId = BigInt(update.message!.chat.id)

  // Mahalla lookup — resolve district_id and mahalla_id
  const mahalla = await prisma.mahalla.findUnique({
    where: { telegram_chat_id: chatId },
  })

  if (!mahalla) {
    logger.warn(
      { updateId, chatId: chatId.toString() },
      'Pre-filter discard: unmonitored group (no mahalla match)',
    )
    return
  }

  const senderDisplayName =
    [from.first_name, from.last_name].filter(Boolean).join(' ') || null

  // Idempotent upsert — duplicate telegram_update_id is a no-op
  await prisma.rawMessage.upsert({
    where:  { telegram_update_id: update.update_id },
    update: {},   // no-op if row already exists (idempotent)
    create: {
      telegram_update_id:  update.update_id,
      telegram_message_id: update.message!.message_id,
      chat_id:             chatId,
      district_id:         mahalla.district_id,
      mahalla_id:          mahalla.id,
      sender_display_name: senderDisplayName,
      sender_username:     from.username ?? null,
      text:                rawText,
      text_source,
      telegram_timestamp:  new Date(update.message!.date * 1000),
    },
  })

  logger.info(
    {
      updateId,
      chatId:    chatId.toString(),
      mahallaId: mahalla.id,
      districtId: mahalla.district_id,
      text_source,
    },
    'Message ingested to raw_messages',
  )
}
