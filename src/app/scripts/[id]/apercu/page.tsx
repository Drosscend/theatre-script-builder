import { notFound } from "next/navigation";
import { ScriptPreview } from "@/components/script-preview";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "lucide-react";
import { ScriptPDFGenerator } from "@/components/script-pdf-generator";

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
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <Card className="w-full">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{script.name}</CardTitle>
              {script.description && <CardDescription>{script.description}</CardDescription>}
            </div>
            <div className="flex gap-2">
              <ScriptPDFGenerator script={script.items} characters={script.characters} />
              <Link href={`/scripts/${(await params).id}`} passHref>
                <Button variant="outline">
                  <ArrowLeftIcon />
                  Retour à l'éditeur
                </Button>
              </Link>
            </div>
          </CardHeader>
        </Card>
      </div>

      <ScriptPreview script={script.items} characters={script.characters} />
    </div>
  );
} 