"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

// Schéma de validation
const characterSchema = z.object({
  realName: z.string().min(1, "Le nom réel est requis"),
  stageName: z.string().min(1, "Le nom de scène est requis"),
  role: z.string(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, "Format de couleur invalide"),
});

// Créer un nouveau personnage
export async function createCharacter(scriptId: string, data: z.infer<typeof characterSchema>) {
  try {
    const validatedData = characterSchema.parse(data);

    const character = await prisma.character.create({
      data: {
        ...validatedData,
        scriptId,
      },
    });

    revalidatePath(`/scripts/${scriptId}`);
    return { success: true, data: character };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors };
    }
    return { success: false, error: "Une erreur est survenue lors de la création du personnage" };
  }
}

// Récupérer tous les personnages d'un script
export async function getCharacters(scriptId: string) {
  try {
    const characters = await prisma.character.findMany({
      where: { scriptId },
      orderBy: { stageName: "asc" },
    });

    return { success: true, data: characters };
  } catch (error) {
    return { success: false, error: "Une erreur est survenue lors de la récupération des personnages" };
  }
}

// Mettre à jour un personnage
export async function updateCharacter(id: string, data: z.infer<typeof characterSchema>) {
  try {
    const validatedData = characterSchema.parse(data);

    const character = await prisma.character.findUnique({
      where: { id },
      select: { scriptId: true },
    });

    if (!character) {
      return { success: false, error: "Personnage non trouvé" };
    }

    const updatedCharacter = await prisma.character.update({
      where: { id },
      data: validatedData,
    });

    revalidatePath(`/scripts/${character.scriptId}`);
    return { success: true, data: updatedCharacter };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors };
    }
    return { success: false, error: "Une erreur est survenue lors de la mise à jour du personnage" };
  }
}

// Supprimer un personnage
export async function deleteCharacter(id: string) {
  try {
    const character = await prisma.character.findUnique({
      where: { id },
      select: { scriptId: true },
    });

    if (!character) {
      return { success: false, error: "Personnage non trouvé" };
    }

    await prisma.character.delete({
      where: { id },
    });

    revalidatePath(`/scripts/${character.scriptId}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: "Une erreur est survenue lors de la suppression du personnage" };
  }
}
