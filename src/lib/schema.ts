import { z } from "zod";

export const characterSchema = z.object({
  realName: z.string().min(1, "Le nom réel est requis"),
  stageName: z.string().min(1, "Le nom de scène est requis"),
  role: z.string(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, "Format de couleur invalide").default("#e2e8f0"),
});

export type CharacterFormValues = z.infer<typeof characterSchema>; 