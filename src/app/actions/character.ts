"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { characterSchema } from "@/lib/schema";
import { z } from "zod";
import { action } from "@/lib/safe-action";

// Créer un nouveau personnage
export const createCharacter = action
  .schema(characterSchema)
  .schema(async (prevSchema) => {
    return prevSchema.extend({
      scriptId: z.string()
    });
  })
  .action(async ({ parsedInput }) => {
    try {
      const character = await prisma.character.create({
        data: {
          ...parsedInput,
        },
      });

      revalidatePath(`/scripts/${parsedInput.scriptId}`);
      revalidatePath(`/scripts/${parsedInput.scriptId}/apercu`);
      return { data: character };
    } catch (error) {
      throw new Error("Une erreur est survenue lors de la création du personnage");
    }
  });

// Mettre à jour un personnage
export const updateCharacter = action
  .schema(characterSchema)
  .schema(async (prevSchema) => {
    return prevSchema.extend({
      id: z.string()
    });
  })
  .action(async ({ parsedInput }) => {
    try {
      const character = await prisma.character.findUnique({
        where: { id: parsedInput.id },
        select: { scriptId: true },
      });

      if (!character) {
        throw new Error("Personnage non trouvé");
      }

      const updatedCharacter = await prisma.character.update({
        where: { id: parsedInput.id },
        data: parsedInput,
      });

      revalidatePath(`/scripts/${character.scriptId}`);
      revalidatePath(`/scripts/${character.scriptId}/apercu`);
      return { data: updatedCharacter };
    } catch (error) {
      throw new Error("Une erreur est survenue lors de la mise à jour du personnage");
    }
  });

// Supprimer un personnage
export const deleteCharacter = action
  .schema(z.object({
    id: z.string()
  }))
  .action(async ({ parsedInput }) => {
    try {
      const character = await prisma.character.findUnique({
        where: { id: parsedInput.id },
        select: { scriptId: true },
      });

      if (!character) {
        throw new Error("Personnage non trouvé");
      }

      await prisma.character.delete({
        where: { id: parsedInput.id },
      });

      revalidatePath(`/scripts/${character.scriptId}`);
      revalidatePath(`/scripts/${character.scriptId}/apercu`);
      return { success: true };
    } catch (error) {
      throw new Error("Une erreur est survenue lors de la suppression du personnage");
    }
  });

// Supprimer tous les personnages
export const deleteAllCharacters = action
  .schema(z.object({
    scriptId: z.string()
  }))
  .action(async ({ parsedInput }) => {
    try {
      await prisma.character.deleteMany({
        where: { scriptId: parsedInput.scriptId },
      });
      return { success: true };
    } catch (error) {
      throw new Error("Une erreur est survenue lors de la suppression des personnages");
    }
  });
