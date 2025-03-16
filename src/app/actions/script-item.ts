"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { scriptItemSchema, type ScriptItemFormValues } from "@/lib/schema";
import { type ScriptItemWithRelations } from "@/lib/types";
import { Character } from "@prisma/client";

export async function createScriptItem(scriptId: string, data: ScriptItemFormValues, position?: number) {
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
          position: itemPosition,
          scriptId,
        },
      });

      // Créer les relations spécifiques au type
      if (validatedData.type === "narration") {
        await tx.narration.create({
          data: {
            text: validatedData.text || "",
            characterId: validatedData.character || "",
            scriptItemId: scriptItem.id,
          },
        });
      }

      if (validatedData.type === "dialogue") {
        await tx.dialogue.create({
          data: {
            text: validatedData.text || "",
            characterId: validatedData.character || "",
            scriptItemId: scriptItem.id,
          },
        });
      }

      if (validatedData.type === "lighting") {
        await tx.lighting.create({
          data: {
            color: validatedData.lightColor || "",
            position: validatedData.lightPosition || "",
            scriptItemId: scriptItem.id,
          },
        });
      }

      if (validatedData.type === "sound") {
        await tx.sound.create({
          data: {
            type: validatedData.soundType || "",
            name: validatedData.soundName || "",
            url: validatedData.soundUrl || "",
            timecode: validatedData.soundTimecode || "",
            description: validatedData.soundDescription || "",
            scriptItemId: scriptItem.id,
          },
        });
      }

      if (validatedData.type === "image") {
        await tx.image.create({
          data: {
            type: validatedData.imageType || "",
            url: validatedData.imageUrl || "",
            width: validatedData.imageWidth || 0,
            height: validatedData.imageHeight || 0,
            caption: validatedData.imageCaption || "",
            scriptItemId: scriptItem.id,
          },
        });
      }

      if (validatedData.type === "staging") {
        await tx.staging.create({
          data: {
            item: validatedData.stagingItem || "",
            position: validatedData.stagingPosition || "",
            description: validatedData.stagingDescription || "",
            scriptItemId: scriptItem.id,
          },
        });
      }

      if (validatedData.type === "movement") {
        await tx.movement.create({
          data: {
            characterId: validatedData.movementCharacter || "",
            from: validatedData.movementFrom || "",
            to: validatedData.movementTo || "",
            description: validatedData.movementDescription || "",
            scriptItemId: scriptItem.id,
          },
        });
      }

      const scriptItemWithRelations = await tx.scriptItem.findUnique({
        where: { id: scriptItem.id },
        include: {
          narration: true,
          dialogue: true,
          image: true,
          lighting: true,
          sound: true,
          staging: true,
          movement: true,
        },
      });

      return scriptItemWithRelations;
    });

    revalidatePath(`/scripts/${scriptId}`);
    revalidatePath(`/scripts/${scriptId}/apercu`);
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
      if (validatedData.type === "dialogue") {  
        await tx.dialogue.update({
          where: { scriptItemId: id },
          data: {
            text: validatedData.text || "",
            characterId: validatedData.character || ""
          },
        });
      }

      if (validatedData.type === "narration") {
        await tx.narration.update({
          where: { scriptItemId: id },
          data: { 
            text: validatedData.text || "",
            characterId: validatedData.character || ""
           },
        });
      }
      
      if (validatedData.type === "lighting") {
        await tx.lighting.update({
          where: { scriptItemId: id },
          data: {
            color: validatedData.lightColor || "",
            position: validatedData.lightPosition || "",
            isOff: validatedData.lightIsOff || false
          },
        });
      }

      if (validatedData.type === "sound") {
        await tx.sound.update({
          where: { scriptItemId: id },
          data: {
            type: validatedData.soundType || "",
            name: validatedData.soundName || "",
            url: validatedData.soundUrl || "",
            timecode: validatedData.soundTimecode || "",
            description: validatedData.soundDescription || "",
            isStop: validatedData.soundIsStop || false,
          },
        });
      }

      if (validatedData.type === "image") {
        await tx.image.update({
          where: { scriptItemId: id },
          data: {
            type: validatedData.imageType || "",
            url: validatedData.imageUrl || "",
            width: validatedData.imageWidth || 0,
            height: validatedData.imageHeight || 0,
            caption: validatedData.imageCaption || ""
          },
        });
      }

      if (validatedData.type === "staging") {
        await tx.staging.update({
          where: { scriptItemId: id },
          data: {
            item: validatedData.stagingItem || "",
            position: validatedData.stagingPosition || "",
            description: validatedData.stagingDescription || ""
          },
        });
      }

      if (validatedData.type === "movement") {
        await tx.movement.update({
          where: { scriptItemId: id },
          data: {
            from: validatedData.movementFrom || "",
            to: validatedData.movementTo || "",
            description: validatedData.movementDescription || "",
            characterId: validatedData.movementCharacter || ""
          },
        });
      }
    });

    const scriptItemWithRelations = await prisma.scriptItem.findUnique({
      where: { id },
      include: {
        narration: true,
        dialogue: true,
        image: true,
        lighting: true,
        sound: true,
        staging: true,
        movement: true,
      },
    });

    revalidatePath(`/scripts/${scriptItem.scriptId}`);
    revalidatePath(`/scripts/${scriptItem.scriptId}/apercu`);
    return { success: true, data: scriptItemWithRelations };
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
    revalidatePath(`/scripts/${scriptItem.scriptId}/apercu`);
    return { success: true };
  } catch (error) {
    return { success: false, error: "Une erreur est survenue lors de la suppression de l'élément" };
  }
}

// Supprimer tous les éléments de script
export async function deleteAllScriptItems(scriptId: string) {
  await prisma.scriptItem.deleteMany({ where: { scriptId } });
  revalidatePath(`/scripts/${scriptId}`);
  revalidatePath(`/scripts/${scriptId}/apercu`);
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
    revalidatePath(`/scripts/${scriptId}/apercu`);
    return { success: true };
  } catch (error) {
    return { success: false, error: "Une erreur est survenue lors de la réorganisation des éléments" };
  }
}

// Importer des éléments de script depuis un fichier JSON
export async function importScriptItems(scriptId: string, importData: { script: ScriptItemWithRelations[], characters: Character[] }) {
  try {
    // Créer un mapping des anciens vers les nouveaux IDs de personnages
    const characterMapping = new Map<string, string>();
    
    // Créer les nouveaux personnages et stocker le mapping des IDs
    for (const character of importData.characters) {
      const newCharacter = await prisma.character.create({
        data: {
          realName: character.realName,
          stageName: character.stageName,
          role: character.role,
          color: character.color,
          scriptId: scriptId
        }
      });
      characterMapping.set(character.id, newCharacter.id);
    }

    // Créer les nouveaux éléments de script avec leurs relations
    const scriptItemsData = importData.script.map((item, index) => {
      const baseItem = {
        type: item.type,
        position: index,
        scriptId,
      };

      let relationData = {};

      if (item.dialogue) {
        relationData = {
          dialogue: {
            create: {
              text: item.dialogue.text || "",
              characterId: item.dialogue.characterId ? characterMapping.get(item.dialogue.characterId) || "" : "",
            }
          }
        };
      }

      if (item.narration) {
        relationData = {
          narration: {
            create: {
              text: item.narration.text || "",
              characterId: item.narration.characterId ? characterMapping.get(item.narration.characterId) || "" : "",
            }
          }
        };
      }

      if (item.lighting) {
        relationData = {
          lighting: {
            create: {
              color: item.lighting.color,
              position: item.lighting.position,
              isOff: item.lighting.isOff || false,
            }
          }
        };
      }

      if (item.sound) {
        relationData = {
          sound: {
            create: {
              type: item.sound.type,
              name: item.sound.name,
              url: item.sound.url,
              timecode: item.sound.timecode,
              description: item.sound.description,
              isStop: item.sound.isStop || false,
            }
          }
        };
      }

      if (item.image) {
        relationData = {
          image: {
            create: {
              type: item.image.type,
              url: item.image.url,
              width: item.image.width,
              height: item.image.height,
              caption: item.image.caption,
            }
          }
        };
      }

      if (item.staging) {
        relationData = {
          staging: {
            create: {
              item: item.staging.item,
              position: item.staging.position,
              description: item.staging.description,
            }
          }
        };
      }

      if (item.movement) {
        relationData = {
          movement: {
            create: {
              from: item.movement.from,
              to: item.movement.to,
              description: item.movement.description,
              characterId: characterMapping.get(item.movement.characterId) || "",
            }
          }
        };
      }

      return {
        data: {
          ...baseItem,
          ...relationData
        }
      };
    });

    // Créer tous les éléments en utilisant des transactions
    await prisma.$transaction(
      scriptItemsData.map(itemData => 
        prisma.scriptItem.create(itemData)
      )
    );

    const scriptWithRelations = await prisma.script.findUnique({
      where: { id: scriptId },
      include: {
        items: {
          include: {
            narration: true,
            dialogue: true,
            image: true,
            lighting: true,
            sound: true,
            staging: true,
            movement: true,
          },
          orderBy: { position: 'asc' },
        },
      },
    });

    revalidatePath(`/scripts/${scriptId}`);
    revalidatePath(`/scripts/${scriptId}/apercu`);
    return { success: true, data: scriptWithRelations };
  } catch (error) {
    console.error('Import error:', error);
    return { success: false, error: "Une erreur est survenue lors de l'importation des éléments" };
  }
}
