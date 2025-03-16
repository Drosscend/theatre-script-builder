"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { scriptSchema } from "@/lib/schema";
import { action } from "@/lib/safe-action";

export const createScript = action
  .schema(scriptSchema)
  .action(async ({ parsedInput }) => {
    try {
      const script = await prisma.script.create({
        data: parsedInput,
      });

      revalidatePath("/");
      return { data: script };
    } catch (error) {
      throw new Error("Une erreur est survenue lors de la création du script");
    }
  });

export const deleteScript = action
  .schema(z.object({ id: z.string() }))
  .action(async ({ parsedInput }) => {
    try {
      await prisma.script.delete({
        where: { id: parsedInput.id },
      });

      revalidatePath("/");
      return { success: true };
    } catch (error) {
      console.error(error)
      throw new Error("Une erreur est survenue lors de la suppression du script");
    }
  });
