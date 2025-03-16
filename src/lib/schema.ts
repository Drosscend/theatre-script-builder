import { z } from "zod";

// Character Schema
export const characterSchema = z.object({
  realName: z.string().min(1, "Le nom réel est requis"),
  stageName: z.string().min(1, "Le nom de scène est requis"),
  role: z.string(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, "Format de couleur invalide").default("#e2e8f0"),
});

// Dialogue Schema
const dialogueSchema = z.object({
  type: z.literal("dialogue"),
  character: z.string().optional(),
  text: z.string().optional(),
});

// Narration Schema
const narrationSchema = z.object({
  type: z.literal("narration"),
  text: z.string().optional(),
  character: z.string().optional(),
});

// Lighting Schema
const lightingSchema = z.object({
  type: z.literal("lighting"),
  lightPosition: z.string().optional(),
  lightColor: z.string().optional(),
  lightIsOff: z.boolean().default(false),
  selectedLighting: z.string().optional(),
  useExistingLighting: z.boolean().default(false),
});

// Sound Schema
const soundSchema = z.object({
  type: z.literal("sound"),
  soundUrl: z.string().optional(),
  soundType: z.enum(["url", "base64", "youtube"]).default("url"),
  soundName: z.string().default(""),
  soundTimecode: z.string().optional(),
  soundDescription: z.string().default(""),
  soundIsStop: z.boolean().default(false),
  selectedSound: z.string().optional(),
  useExistingSound: z.boolean().default(false),
});

// Image Schema
const imageSchema = z.object({
  type: z.literal("image"),
  imageUrl: z.string().optional(),
  imageType: z.enum(["url", "base64"]).default("url"),
  imageWidth: z.coerce.number().default(800),
  imageHeight: z.coerce.number().default(600),
  imageCaption: z.string().default(""),
});

// Staging Schema
const stagingSchema = z.object({
  type: z.literal("staging"),
  stagingItem: z.string().optional(),
  stagingPosition: z.string().optional(),
  stagingDescription: z.string().default(""),
});

// Movement Schema
const movementSchema = z.object({
  type: z.literal("movement"),
  movementCharacter: z.string().optional(),
  movementFrom: z.string().optional(),
  movementTo: z.string().optional(),
  movementDescription: z.string().default(""),
});

// Script Item Schema
export const scriptItemSchema = z.discriminatedUnion("type", [
  dialogueSchema,
  narrationSchema,
  lightingSchema,
  soundSchema,
  imageSchema,
  stagingSchema,
  movementSchema,
]);

// Types
export type CharacterFormValues = z.infer<typeof characterSchema>;
export type DialogueFormValues = z.infer<typeof dialogueSchema>;
export type NarrationFormValues = z.infer<typeof narrationSchema>;
export type LightingFormValues = z.infer<typeof lightingSchema>;
export type SoundFormValues = z.infer<typeof soundSchema>;
export type ImageFormValues = z.infer<typeof imageSchema>;
export type StagingFormValues = z.infer<typeof stagingSchema>;
export type MovementFormValues = z.infer<typeof movementSchema>;
export type ScriptItemFormValues = z.infer<typeof scriptItemSchema>;

// Interfaces
export type Character = z.infer<typeof characterSchema>;

export type ExistingLighting = {
  id: string;
  position: string;
  color: string;
};

export type ExistingSound = {
  id: string;
  url: string;
  timecode: string;
  description?: string;
};

export type ScriptItem = ScriptItemFormValues & {
  id: string;
}; 