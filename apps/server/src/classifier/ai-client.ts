import { GoogleGenAI } from '@google/genai'
import { zodToJsonSchema } from 'zod-to-json-schema'
import { env } from '../shared/env.js'
import { buildPrompt } from './prompt.js'
import { ClassifierOutputSchema, type ClassifierOutput } from './schema.js'

const ai = new GoogleGenAI({ apiKey: env.AI_API_KEY })

export async function classifyMessage(text: string): Promise<ClassifierOutput> {
  const response = await ai.models.generateContent({
    model:    env.AI_MODEL,
    contents: buildPrompt(text),
    config:   {
      responseMimeType: 'application/json',
      responseJsonSchema: zodToJsonSchema(ClassifierOutputSchema),
      temperature: 0,
    },
  })

  const rawJson: unknown = JSON.parse(response.text ?? '{}')
  const result = ClassifierOutputSchema.safeParse(rawJson)

  if (!result.success) {
    throw new Error(`AI output schema invalid: ${result.error.message}`)
  }

  return result.data
}
