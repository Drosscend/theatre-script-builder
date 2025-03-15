"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { characterSchema } from "@/lib/schema";
import type { CharacterFormValues } from "@/lib/schema";
import { z } from "zod";

// Créer un nouveau personnage
export async function createCharacter(scriptId: string, data: CharacterFormValues) {
  try {
    const validatedData = characterSchema.parse(data);

    const character = await prisma.character.create({
      data: {
        ...validatedData,
        scriptId,
      },
    });

    revalidatePath(`/scripts/${scriptId}`);
    revalidatePath(`/scripts/${scriptId}/apercu`);
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
export async function updateCharacter(id: string, data: CharacterFormValues) {
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
    revalidatePath(`/scripts/${character.scriptId}/apercu`);
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
    revalidatePath(`/scripts/${character.scriptId}/apercu`);
    return { success: true };
  } catch (error) {
    return { success: false, error: "Une erreur est survenue lors de la suppression du personnage" };
  }
}

export async function deleteAllCharacters(scriptId: string) {
  await prisma.character.deleteMany({
    where: { scriptId },
  });
}
