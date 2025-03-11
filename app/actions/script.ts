"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

// Schémas de validation
const scriptSchema = z.object({
  name: z.string().min(1, "Le titre est requis"),
  description: z.string().optional(),
});

const characterSchema = z.object({
  realName: z.string().min(1, "Le nom réel est requis"),
  stageName: z.string().min(1, "Le nom de scène est requis"),
  role: z.string(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, "Format de couleur invalide"),
});

const scriptItemSchema = z.object({
  type: z.enum(["dialogue", "narration", "lighting", "sound", "image", "staging", "movement"]),
  text: z.string().optional(),
  characterId: z.string().optional(),
  
  // Champs spécifiques aux types
  lighting: z.object({
    position: z.string(),
    color: z.string(),
  }).optional(),
  
  sound: z.object({
    url: z.string(),
    timecode: z.string(),
    description: z.string().optional(),
  }).optional(),
  
  image: z.object({
    url: z.string(),
    caption: z.string().optional(),
  }).optional(),
  
  staging: z.object({
    item: z.string(),
    position: z.string(),
    description: z.string().optional(),
  }).optional(),
  
  movement: z.object({
    characterId: z.string(),
    from: z.string(),
    to: z.string(),
    description: z.string().optional(),
  }).optional(),
});

// Créer un nouveau script
export async function createScript(data: z.infer<typeof scriptSchema>) {
  try {
    const validatedData = scriptSchema.parse(data);
    
    const script = await prisma.script.create({
      data: validatedData,
    });
    
    revalidatePath("/");
    return { success: true, data: script };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors };
    }
    return { success: false, error: "Une erreur est survenue lors de la création du script" };
  }
}

// Récupérer tous les scripts
export async function getScripts() {
  try {
    const scripts = await prisma.script.findMany({
      orderBy: { updatedAt: "desc" },
    });
    
    return { success: true, data: scripts };
  } catch (error) {
    return { success: false, error: "Une erreur est survenue lors de la récupération des scripts" };
  }
}

// Récupérer un script avec tous ses éléments et personnages
export async function getScript(id: string) {
  try {
    const script = await prisma.script.findUnique({
      where: { id },
      include: {
        characters: true,
        items: {
          include: {
            character: true,
            lighting: true,
            sound: true,
            image: true,
            staging: true,
            movement: true,
          },
          orderBy: { position: "asc" },
        },
      },
    });
    
    if (!script) {
      return { success: false, error: "Script non trouvé" };
    }
    
    return { success: true, data: script };
  } catch (error) {
    return { success: false, error: "Une erreur est survenue lors de la récupération du script" };
  }
}

// Mettre à jour un script
export async function updateScript(id: string, data: z.infer<typeof scriptSchema>) {
  try {
    const validatedData = scriptSchema.parse(data);
    
    const script = await prisma.script.update({
      where: { id },
      data: validatedData,
    });
    
    revalidatePath(`/scripts/${id}`);
    return { success: true, data: script };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors };
    }
    return { success: false, error: "Une erreur est survenue lors de la mise à jour du script" };
  }
}

// Supprimer un script
export async function deleteScript(id: string) {
  try {
    await prisma.script.delete({
      where: { id },
    });
    
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Une erreur est survenue lors de la suppression du script" };
  }
} 