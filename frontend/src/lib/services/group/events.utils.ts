import { z } from "zod";
import { areTagsValidForExpenseEvent } from "./areTagsValidForExpenseEvent";
import { areTagsValidForMetadataEvent } from "./areTagsValidForMetadataEvent";
import { GROUP_KIND, METADATA_KIND } from "../../../constants";

export const idSchema = z
  .string()
  .length(64)
  .regex(/[0-9a-f]/);

const baseEventSchema = z.object({
  id: idSchema,
  // After 14 Jul 2017 and before 18 May 2033, ensures timestamps are of an
  // appropriate length
  created_at: z.number().int().min(1.5e9).max(2e9),
  pubkey: idSchema,
  sig: z
    .string()
    .length(128)
    .regex(/[0-9a-f]/),
});

export const createEventSchema = baseEventSchema.extend({
  kind: z.literal(GROUP_KIND),
  content: z.literal(""),
  tags: z.string().array().length(0).array(),
});

export const expenseEventSchema = baseEventSchema.extend({
  kind: z.literal(GROUP_KIND),
  content: z.literal(""),
  tags: z
    .string()
    .array()
    .array()
    .refine(
      areTagsValidForExpenseEvent,
      "#1iYr2i Invalid tags for expense event"
    ),
});

const profileSchema = z.object({
  name: z.string().optional(),
  about: z.string().optional(),
  picture: z.string().url().optional().or(z.string().length(0)),
});

export const metadataEventSchema = baseEventSchema.extend({
  kind: z.literal(METADATA_KIND),
  content: z.string().refine((content) => {
    try {
      const profile = JSON.parse(content);
      profileSchema.parse(profile);
      return true;
    } catch {
      return false;
    }
  }),
  tags: z.string().array().array().refine(areTagsValidForMetadataEvent),
});
