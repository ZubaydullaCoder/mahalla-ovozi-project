// apps/server/src/shared/types.ts
// All API response shape types. DB snake_case rows are mapped to these in signals/mapper.ts

export interface Signal {
  id:                 number
  telegramUpdateId:   number
  telegramMessageId:  number
  telegramMessageUrl: string | null
  districtId:         number
  mahallaId:          number
  mahallaName:        string
  senderDisplayName:  string | null
  senderUsername:     string | null
  telegramTimestamp:  string    // ISO 8601 UTC
  rawText:            string
  textSource:         'text' | 'caption'
  category:           'water' | 'electricity' | 'gas' | 'waste'
  hokimRelated:       boolean
  keywordMatched:     boolean
  matchedKeyword:     string | null
  shortLabel:         string | null
  classifiedAt:       string    // ISO 8601 UTC
}

export interface Mahalla {
  id:         number
  districtId: number
  name:       string
}

export interface Keyword {
  id:        number
  phrase:    string
  isActive:  boolean
  createdAt: string
  updatedAt: string
}

export interface BotConnectivity {
  mahallaId:    number
  mahallaName:  string
  botStatus:    'active' | 'removed' | 'unknown'
  botLastSeenAt: string | null
}

export interface HealthStatus {
  lastBatchAt:             string | null
  botConnectivity:         BotConnectivity[]
  errorsLastRun:           string | null
  status:                  'ok' | 'failed' | 'running' | 'never_run'
  pendingRawMessages:      number
  preFilterDiscards:       number
  ignoredCount:            number
  filterMode:              'ai_full' | 'keyword_gate' | 'shadow_compare'
  keywordMatchedCount:     number
  keywordSkippedCount:     number
  keywordAiSignalCount:    number
  keywordAiIgnoreCount:    number
  noKeywordAiSignalCount:  number
  noKeywordAiIgnoreCount:  number
}
