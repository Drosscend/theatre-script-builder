"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

// Schémas de validation
const lightingSchema = z.object({
  position: z.string(),
  color: z.string(),
  isOff: z.boolean().optional().default(false),
});

const soundSchema = z.object({
  url: z.string(),
  timecode: z.string(),
  description: z.string().optional(),
  isStop: z.boolean().optional().default(false),
});

const imageSchema = z.object({
  url: z.string(),
  caption: z.string().optional(),
});

const stagingSchema = z.object({
  item: z.string(),
  position: z.string(),
  description: z.string().optional(),
});

const movementSchema = z.object({
  characterId: z.string(),
  from: z.string(),
  to: z.string(),
  description: z.string().optional(),
});

const scriptItemSchema = z.object({
  type: z.enum(["dialogue", "narration", "lighting", "sound", "image", "staging", "movement"]),
  text: z.string().optional(),
  characterId: z.string().optional(),
  lighting: lightingSchema.optional(),
  sound: soundSchema.optional(),
  image: imageSchema.optional(),
  staging: stagingSchema.optional(),
  movement: movementSchema.optional(),
});

// Créer un nouvel élément de script
export async function createScriptItem(scriptId: string, data: z.infer<typeof scriptItemSchema>, position?: number) {
  try {
    const validatedData = scriptItemSchema.parse(data);

    // Déterminer la position si non spécifiée
    let itemPosition = position;
    if (itemPosition === undefined) {
      const lastItem = await prisma.scriptItem.findFirst({
        where: { scriptId },
        orderBy: { position: "desc" },
        select: { position: true },
      });

      itemPosition = lastItem ? lastItem.position + 1 : 0;
    }

    // Transaction pour créer l'élément et ses relations
    const result = await prisma.$transaction(async (tx) => {
      // Créer l'élément de base
      const scriptItem = await tx.scriptItem.create({
        data: {
          type: validatedData.type,
          text: validatedData.text,
          characterId: validatedData.characterId,
          position: itemPosition,
          scriptId,
        },
      });

      // Créer les relations spécifiques au type
      if (validatedData.lighting && validatedData.type === "lighting") {
        await tx.lighting.create({
          data: {
            ...validatedData.lighting,
            scriptItemId: scriptItem.id,
          },
        });
      }

      if (validatedData.sound && validatedData.type === "sound") {
        await tx.sound.create({
          data: {
            ...validatedData.sound,
            scriptItemId: scriptItem.id,
          },
        });
      }

      if (validatedData.image && validatedData.type === "image") {
        await tx.image.create({
          data: {
            ...validatedData.image,
            scriptItemId: scriptItem.id,
          },
        });
      }

      if (validatedData.staging && validatedData.type === "staging") {
        await tx.staging.create({
          data: {
            ...validatedData.staging,
            scriptItemId: scriptItem.id,
          },
        });
      }

      if (validatedData.movement && validatedData.type === "movement") {
        await tx.movement.create({
          data: {
            from: validatedData.movement.from,
            to: validatedData.movement.to,
            description: validatedData.movement.description,
            characterId: validatedData.movement.characterId,
            scriptItemId: scriptItem.id,
          },
        });
      }

      return scriptItem;
    });

    revalidatePath(`/scripts/${scriptId}`);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors };
    }
    return { success: false, error: "Une erreur est survenue lors de la création de l'élément" };
  }
}

// Mettre à jour un élément de script
export async function updateScriptItem(id: string, data: z.infer<typeof scriptItemSchema>) {
  try {
    const validatedData = scriptItemSchema.parse(data);

    const scriptItem = await prisma.scriptItem.findUnique({
      where: { id },
      select: { scriptId: true, type: true },
    });

    if (!scriptItem) {
      return { success: false, error: "Élément non trouvé" };
    }

    // Transaction pour mettre à jour l'élément et ses relations
    await prisma.$transaction(async (tx) => {
      // Mettre à jour l'élément de base
      await tx.scriptItem.update({
        where: { id },
        data: {
          type: validatedData.type,
          text: validatedData.text,
          characterId: validatedData.characterId,
        },
      });

      // Si le type a changé, supprimer les anciennes relations
      if (scriptItem.type !== validatedData.type) {
        switch (scriptItem.type) {
          case "lighting":
            await tx.lighting.deleteMany({ where: { scriptItemId: id } });
            break;
          case "sound":
            await tx.sound.deleteMany({ where: { scriptItemId: id } });
            break;
          case "image":
            await tx.image.deleteMany({ where: { scriptItemId: id } });
            break;
          case "staging":
            await tx.staging.deleteMany({ where: { scriptItemId: id } });
            break;
          case "movement":
            await tx.movement.deleteMany({ where: { scriptItemId: id } });
            break;
        }
      }

      // Mettre à jour ou créer les relations spécifiques au type
      if (validatedData.lighting && validatedData.type === "lighting") {
        await tx.lighting.upsert({
          where: { scriptItemId: id },
          update: validatedData.lighting,
          create: {
            ...validatedData.lighting,
            scriptItemId: id,
          },
        });
      }

      if (validatedData.sound && validatedData.type === "sound") {
        await tx.sound.upsert({
          where: { scriptItemId: id },
          update: validatedData.sound,
          create: {
            ...validatedData.sound,
            scriptItemId: id,
          },
        });
      }

      if (validatedData.image && validatedData.type === "image") {
        await tx.image.upsert({
          where: { scriptItemId: id },
          update: validatedData.image,
          create: {
            ...validatedData.image,
            scriptItemId: id,
          },
        });
      }

      if (validatedData.staging && validatedData.type === "staging") {
        await tx.staging.upsert({
          where: { scriptItemId: id },
          update: validatedData.staging,
          create: {
            ...validatedData.staging,
            scriptItemId: id,
          },
        });
      }

      if (validatedData.movement && validatedData.type === "movement") {
        await tx.movement.upsert({
          where: { scriptItemId: id },
          update: {
            from: validatedData.movement.from,
            to: validatedData.movement.to,
            description: validatedData.movement.description,
            characterId: validatedData.movement.characterId,
          },
          create: {
            from: validatedData.movement.from,
            to: validatedData.movement.to,
            description: validatedData.movement.description,
            characterId: validatedData.movement.characterId,
            scriptItemId: id,
          },
        });
      }
    });

    revalidatePath(`/scripts/${scriptItem.scriptId}`);
    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors };
    }
    return { success: false, error: "Une erreur est survenue lors de la mise à jour de l'élément" };
  }
}

// Supprimer un élément de script
export async function deleteScriptItem(id: string) {
  try {
    const scriptItem = await prisma.scriptItem.findUnique({
      where: { id },
      select: { scriptId: true },
    });

    if (!scriptItem) {
      return { success: false, error: "Élément non trouvé" };
    }

    await prisma.scriptItem.delete({
      where: { id },
    });

    revalidatePath(`/scripts/${scriptItem.scriptId}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: "Une erreur est survenue lors de la suppression de l'élément" };
  }
}

// Réorganiser les éléments de script
export async function reorderScriptItems(scriptId: string, itemIds: string[]) {
  try {
    // Vérifier que tous les éléments appartiennent au même script
    const items = await prisma.scriptItem.findMany({
      where: { id: { in: itemIds } },
      select: { id: true, scriptId: true },
    });

    const invalidItems = items.filter((item) => item.scriptId !== scriptId);
    if (invalidItems.length > 0) {
      return { success: false, error: "Certains éléments n'appartiennent pas à ce script" };
    }

    // Mettre à jour les positions
    await prisma.$transaction(
      itemIds.map((id, index) =>
        prisma.scriptItem.update({
          where: { id },
          data: { position: index },
        })
      )
    );

    revalidatePath(`/scripts/${scriptId}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: "Une erreur est survenue lors de la réorganisation des éléments" };
  }
}
