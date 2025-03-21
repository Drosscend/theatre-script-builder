import { Card } from "@/components/ui/card";
import { Button } from "./ui/button";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { ScriptPDFGenerator } from "./script-pdf-generator";
import { ScriptWithRelations } from "@/lib/types";

export const ScriptPreviewProps = {
  script: {} as ScriptWithRelations,
  scriptId: "",
  scriptName: "",
};

export function ScriptPreview({ script, scriptId, scriptName }: typeof ScriptPreviewProps) {
  const characters = script.characters;
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{scriptName}</h1>
        <div className="flex gap-2">  
          <Link href={`/scripts/${scriptId}`} passHref>
            <Button variant="outline">
              <ArrowLeftIcon />
              Retour à l'éditeur
            </Button>
          </Link>
          <ScriptPDFGenerator script={script} />
        </div>
      </div>
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Aperçu du script</h2>
        <div className="prose max-w-none">
          {script.items.map((item, index) => {
            const itemType = item.type;

            const lineNumber = (
              <div className="text-sm text-gray-400 w-8 flex-shrink-0 select-none">
                {(index + 1).toString().padStart(2, '0')}
              </div>
            );

            if (itemType === "dialogue" && item.dialogue) {
              const processedText = item.dialogue.text;
              const character = characters.find((c) => c.id === item.dialogue?.characterId);

              return (
                <div key={item.id} className="mb-4 flex">
                  {lineNumber}
                  <div className="flex-1">
                    <p className="font-bold" style={{ color: character?.color || "#000000" }}>
                      {`${character?.stageName} (${character?.realName}):`}
                    </p>
                    <p className="ml-8">{processedText}</p>
                  </div>
                </div>
              );
            } else if (itemType === "narration" && item.narration) {
              const processedText = item.narration.text;
              const narrator = characters.find((c) => c.id === item.narration?.characterId);

              const narratorPrefix = narrator ? (
                <span className="font-bold" style={{ color: narrator.color }}>
                  {`${narrator.stageName} (${narrator.realName}): `}
                </span>
              ) : null;

              return (
                <div key={item.id} className="mb-4 flex">
                  {lineNumber}
                  <div className="flex-1 italic">
                    {narratorPrefix}
                    <p>{processedText}</p>
                  </div>
                </div>
              );
            } else if (itemType === "lighting" && item.lighting) {
              return (
                <div key={item.id} className="mb-4 flex">
                  {lineNumber}
                  <div className="flex-1 p-2 bg-slate-100 dark:bg-slate-800 rounded">
                    <p className="text-sm font-semibold">LUMIÈRE:</p>
                    <p className="text-sm">
                      Position: {`${item.lighting.position}`}, Couleur:{" "}
                      <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: item.lighting.color }}></span>{" "}
                      {`${item.lighting.color}`}
                    </p>
                  </div>
                </div>
              );
            } else if (item.type === "sound" && item.sound) {
              const renderSoundContent = () => {
                if (item.sound?.isStop) {
                  return (
                    <p className="text-sm">
                      Arrêt de la musique: {item.sound.description || ""}
                    </p>
                  );
                }

                switch (item.sound?.type) {
                  case "youtube":
                    return (
                      <div className="my-2">
                        <iframe
                          width="100%"
                          height="315"
                          src={item.sound.url
                            .replace("youtu.be/", "www.youtube.com/watch?v=")
                            .replace("watch?v=", "embed/")
                            .replace("youtube.com", "youtube-nocookie.com")
                            .replace(/&t=(\d+)s/, "?amp;start=$1")
                          }
                          title={item.sound.name}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      </div>
                    );
                  case "url":
                  case "base64":
                    return (
                      <div className="my-2">
                        <audio controls className="w-full">
                          <source src={item.sound.url} type="audio/mpeg" />
                          Votre navigateur ne supporte pas la lecture audio.
                        </audio>
                      </div>
                    );
                  default:
                    return (
                      <a href={item.sound?.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                        {item.sound?.name || item.sound?.url}
                      </a>
                    );
                }
              };

              return (
                <div key={item.id} className="mb-4 flex">
                  {lineNumber}
                  <div className="flex-1 p-2 bg-slate-100 dark:bg-slate-800 rounded">
                    <p className="text-sm font-semibold">SON:</p>
                    <p className="text-sm">
                      {item.sound.name} ({item.sound.timecode})
                    </p>
                    {item.sound.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {item.sound.description}
                      </p>
                    )}
                    {renderSoundContent()}
                  </div>
                </div>
              );
            } else if (item.type === "image" && item.image) {
              return (
                <div key={item.id} className="mb-4 flex">
                  {lineNumber}
                  <div className="flex-1 p-2 bg-slate-100 dark:bg-slate-800 rounded">
                    <p className="text-sm font-semibold">IMAGE:</p>
                    <div className="my-2">
                      <div className="relative w-full" style={{ 
                        aspectRatio: `${item.image.width || 16}/${item.image.height || 9}`,
                        maxWidth: `${item.image.width || 800}px`,
                        maxHeight: `${item.image.height || 600}px`,
                        margin: '0 auto'
                      }}>
                        <img
                          src={item.image.url}
                          alt={item.image.caption || "Image"}
                          className="w-full h-full object-contain rounded"
                        />
                      </div>
                    </div>
                    {item.image.caption && <p className="text-sm text-center italic mt-1">{item.image.caption}</p>}
                    <p className="text-xs text-center text-muted-foreground mt-1">
                      {item.image.width && item.image.height ? `${item.image.width}x${item.image.height}px` : "Dimensions non spécifiées"}
                    </p>
                  </div>
                </div>
              );
            } else if (item.type === "staging" && item.staging) {
              return (
                <div key={item.id} className="mb-4 flex">
                  {lineNumber}
                  <div className="flex-1 p-2 bg-slate-100 dark:bg-slate-800 rounded">
                    <p className="text-sm font-semibold">MISE EN SCÈNE - {`${item.staging.item}`}:</p>
                    <p className="text-sm">Position: {`${item.staging.position}`}</p>
                    {item.staging.description && <p className="text-sm italic mt-1">{`${item.staging.description}`}</p>}
                  </div>
                </div>
              );
            } else if (item.type === "movement" && item.movement) {
              const movingCharacter = characters.find((c) => c.id === item.movement?.characterId);
              return (
                <div key={item.id} className="mb-4 flex">
                  {lineNumber}
                  <div className="flex-1 p-2 bg-slate-100 dark:bg-slate-800 rounded">
                    <p className="text-sm font-semibold">MOUVEMENT:</p>
                    <p className="text-sm">
                      {`${movingCharacter?.stageName || "Personnage"}`}: {`${item.movement.from}`} → {`${item.movement.to}`}
                    </p>
                    {item.movement.description && <p className="text-sm italic mt-1">{`${item.movement.description}`}</p>}
                  </div>
                </div>
              );
            }
            return null;
          })}
        </div>
      </Card>
    </div>
  );
} 