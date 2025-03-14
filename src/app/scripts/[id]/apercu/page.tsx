import { notFound } from "next/navigation";
import { ScriptPreview } from "@/components/script-preview";
import { prisma } from "@/lib/prisma";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

async function getScript(id: string) {
  const script = await prisma.script.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          character: true,
          lighting: true,
          sound: true,
          image: true,
          staging: true,
          movement: true,
        },
        orderBy: {
          position: "asc",
        },
      },
      characters: true,
    },
  });

  if (!script) {
    notFound();
  }

  // Transformer les éléments du script pour correspondre au format attendu par ScriptPreview
  const transformedItems = script.items.map((item) => {
    const transformedItem: any = {
      id: item.id,
      type: item.type as "dialogue" | "narration" | "lighting" | "sound" | "image" | "staging" | "movement",
      text: item.text || undefined,
      character: item.characterId || undefined,
    };

    // Ajouter les propriétés spécifiques au type
    if (item.lighting) {
      transformedItem.lighting = {
        position: item.lighting.position,
        color: item.lighting.color,
        isOff: item.lighting.isOff || false,
      };
    }

    if (item.sound) {
      transformedItem.sound = {
        url: item.sound.url,
        timecode: item.sound.timecode,
        description: item.sound.description || "",
        isStop: item.sound.isStop || false,
      };
    }

    if (item.image) {
      transformedItem.image = {
        url: item.image.url,
        caption: item.image.caption,
      };
    }

    if (item.staging) {
      transformedItem.staging = {
        item: item.staging.item,
        position: item.staging.position,
        description: item.staging.description,
      };
    }

    if (item.movement) {
      transformedItem.movement = {
        characterId: item.movement.characterId,
        from: item.movement.from,
        to: item.movement.to,
        description: item.movement.description,
      };
    }

    return transformedItem;
  });

  return {
    ...script,
    items: transformedItems,
  };
}

export default async function ScriptPreviewPage({ params }: PageProps) {
  const script = await getScript((await params).id);

  return (
    <div className="container mx-auto space-y-6">
      <ScriptPreview script={script.items} characters={script.characters} scriptId={script.id} scriptName={script.name} />
    </div>
  );
} 