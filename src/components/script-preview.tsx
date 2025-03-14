import { Card } from "@/components/ui/card";

export const Character = {
  id: "",
  realName: "",
  stageName: "",
  role: "",
  color: "",
};

export const LightingEffect = {
  position: "",
  color: "",
  isOff: false,
};

export const SoundEffect = {
  url: "",
  timecode: "",
  description: "",
  isStop: false,
};

export const ScriptItemType = {
  id: "",
  type: "dialogue" as "dialogue" | "narration" | "lighting" | "sound" | "image" | "staging" | "movement",
  character: undefined as string | undefined,
  text: undefined as string | undefined,
  lighting: undefined as typeof LightingEffect | undefined,
  sound: undefined as typeof SoundEffect | undefined,
  image: undefined as
    | {
        url: string;
        caption?: string;
      }
    | undefined,
  staging: undefined as
    | {
        item: string;
        position: string;
        description?: string;
      }
    | undefined,
  movement: undefined as
    | {
        characterId: string;
        from: string;
        to: string;
        description?: string;
      }
    | undefined,
};

export const ScriptPreviewProps = {
  script: [] as Array<
    typeof ScriptItemType & {
      id: string;
      type: "dialogue" | "narration" | "lighting" | "sound" | "image" | "staging" | "movement";
    }
  >,
  characters: [] as Array<
    typeof Character & {
      id: string;
      realName: string;
      stageName: string;
      role: string;
      color: string;
    }
  >,
};

export function ScriptPreview({ script, characters }: typeof ScriptPreviewProps) {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Aperçu du script</h2>
        <div className="prose max-w-none">
          {script.map((item, index) => {
            const character = item.character ? characters.find((c) => c.id === item.character) : null;
            const lineNumber = (
              <div className="text-sm text-gray-400 w-8 flex-shrink-0 select-none">
                {(index + 1).toString().padStart(2, '0')}
              </div>
            );

            if (item.type === "dialogue" && character) {
              const processedText = item.text;

              return (
                <div key={item.id} className="mb-4 flex">
                  {lineNumber}
                  <div className="flex-1">
                    <p className="font-bold" style={{ color: character.color }}>
                      {`${character.stageName} (${character.realName}):`}
                    </p>
                    <p className="ml-8">{processedText}</p>
                  </div>
                </div>
              );
            } else if (item.type === "narration") {
              const processedText = item.text;

              const narratorPrefix = character ? (
                <span className="font-bold" style={{ color: character.color }}>
                  {`${character.stageName} (${character.realName}): `}
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
            } else if (item.type === "lighting" && item.lighting) {
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
              return (
                <div key={item.id} className="mb-4 flex">
                  {lineNumber}
                  <div className="flex-1 p-2 bg-slate-100 dark:bg-slate-800 rounded">
                    <p className="text-sm font-semibold">SON:</p>
                    <p className="text-sm">
                      {`${item.sound.description}`} ({`${item.sound.timecode}`})
                    </p>
                    <p className="text-xs text-blue-500 underline">{`${item.sound.url}`}</p>
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
                      <div className="h-20 w-full flex items-center justify-center border rounded bg-gray-100">
                        <p className="text-gray-500">Image temporairement désactivée</p>
                      </div>
                    </div>
                    {item.image.caption && <p className="text-sm text-center italic mt-1">{`${item.image.caption}`}</p>}
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