import { z } from 'zod/v3'

const CategorySchema = z.enum(['water', 'electricity', 'gas', 'waste'])

export const ClassifierOutputSchema = z.discriminatedUnion('decision', [
  z.object({
    decision:      z.literal('signal'),
    category:      CategorySchema,
    hokim_related: z.boolean().optional(),
    short_label:   z.string().max(100).optional(),
  }),
  z.object({
    decision:      z.literal('ignore'),
    category:      CategorySchema.optional(),
    hokim_related: z.boolean().optional(),
    short_label:   z.string().max(100).optional(),
  }),
])

export type ClassifierOutput = z.infer<typeof ClassifierOutputSchema>
