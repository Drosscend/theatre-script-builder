"use client";

import { createCharacter } from "@/app/actions/character";
import { createScriptItem, deleteAllScriptItems, deleteScriptItem, reorderScriptItems, updateScriptItem } from "@/app/actions/script-item";
import { DndContext, DragEndEvent, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors } from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { SortableContext, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { DownloadIcon, PlusIcon, Trash2Icon, UploadIcon, UsersIcon, Loader2Icon, EyeIcon } from "lucide-react";
import { toast } from "sonner";
import React from "react";
import { useState, useTransition } from "react";
import AddItemDialog from "@/components/add-item-dialog";
import CharactersDialog from "@/components/characters-dialog";
import ScriptItem from "@/components/script-item";
import { ScriptPDFGenerator } from "@/components/script-pdf-generator";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import Link from "next/link";

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

export const ScriptEditorProps = {
  initialScript: [] as Array<
    typeof ScriptItemType & {
      id: string;
      type: "dialogue" | "narration" | "lighting" | "sound" | "image" | "staging" | "movement";
    }
  >,
  initialCharacters: [] as Array<
    typeof Character & {
      id: string;
      realName: string;
      stageName: string;
      role: string;
      color: string;
    }
  >,
  scriptId: "",
};

export function ScriptEditor({ initialScript, initialCharacters, scriptId }: typeof ScriptEditorProps) {
  const [script, setScript] = useState<
    Array<
      typeof ScriptItemType & {
        id: string;
        type: "dialogue" | "narration" | "lighting" | "sound" | "image" | "staging" | "movement";
      }
    >
  >(initialScript);
  const [characters, setCharacters] = useState<
    Array<
      typeof Character & {
        id: string;
        realName: string;
        stageName: string;
        role: string;
        color: string;
      }
    >
  >(initialCharacters);
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);
  const [isCharactersDialogOpen, setIsCharactersDialogOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor));

  /**
   * Récupérer les éléments d'éclairage existants
   */
  const getExistingLightings = () => {
    return script
      .filter(item => item.type === "lighting" && item.lighting && !item.lighting.isOff)
      .map(item => ({
        id: item.id,
        position: item.lighting?.position || "",
        color: item.lighting?.color || "",
      }));
  };

  /**
   * Récupérer les éléments sonores existants
   */
  const getExistingSounds = () => {
    return script
      .filter(item => item.type === "sound" && item.sound && !item.sound.isStop)
      .map(item => ({
        id: item.id,
        url: item.sound?.url || "",
        timecode: item.sound?.timecode || "",
        description: item.sound?.description || "",
      }));
  };

  const handleAddItem = async (item: typeof ScriptItemType) => {
    try {
      const result = await createScriptItem(scriptId, {
        type: item.type,
        text: item.text,
        characterId: item.character,
        lighting: item.lighting,
        sound: item.sound,
        image: item.image,
        staging: item.staging,
        movement:
          item.type === "movement"
            ? {
                characterId: item.movement?.characterId || "",
                from: item.movement?.from || "",
                to: item.movement?.to || "",
                description: item.movement?.description,
              }
            : undefined,
      });

      if (result.success && result.data) {
        const data = result.data as {
          id: string;
          type: string;
          characterId?: string;
          text?: string;
          lighting?: { position: string; color: string; isOff?: boolean };
          sound?: { url: string; timecode: string; description?: string; isStop?: boolean };
          image?: { url: string; caption?: string };
          staging?: { item: string; position: string; description?: string };
          movement?: { characterId: string; from: string; to: string; description?: string };
        };

        const newItem = {
          id: data.id,
          type: data.type as "dialogue" | "narration" | "lighting" | "sound" | "image" | "staging" | "movement",
          character: data.characterId || undefined,
          text: data.text || undefined,
          lighting: data.lighting
            ? {
                position: data.lighting.position,
                color: data.lighting.color,
                isOff: data.lighting.isOff || false,
              }
            : undefined,
          sound: data.sound
            ? {
                url: data.sound.url,
                timecode: data.sound.timecode,
                description: data.sound.description || "",
                isStop: data.sound.isStop || false,
              }
            : undefined,
          image: data.image
            ? {
                url: data.image.url,
                caption: data.image.caption || "",
              }
            : undefined,
          staging: data.staging
            ? {
                item: data.staging.item,
                position: data.staging.position,
                description: data.staging.description || "",
              }
            : undefined,
          movement: data.movement
            ? {
                characterId: data.movement.characterId,
                from: data.movement.from,
                to: data.movement.to,
                description: data.movement.description || "",
              }
            : undefined,
        };

        setScript(prevScript => [...prevScript, newItem]);
        
        toast("Élément ajouté", {
          description: "L'élément a été ajouté avec succès",
        });
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout d'un item:", error);
      toast.error("Erreur", {
        description: "Une erreur est survenue lors de l'ajout de l'élément",
      });
    } finally {
      setIsAddItemDialogOpen(false);
    }
  };

  const handleAddItemAtPosition = async (item: typeof ScriptItemType, targetId: string, position: "before" | "after") => {
    const targetIndex = script.findIndex((item) => item.id === targetId);
    if (targetIndex === -1) return;

    try {
      const newIndex = position === "after" ? targetIndex + 1 : targetIndex;

      const result = await createScriptItem(
        scriptId,
        {
          type: item.type,
          text: item.text,
          characterId: item.character,
          lighting: item.lighting,
          sound: item.sound,
          image: item.image,
          staging: item.staging,
          movement:
            item.type === "movement"
              ? {
                  characterId: item.movement?.characterId || "",
                  from: item.movement?.from || "",
                  to: item.movement?.to || "",
                  description: item.movement?.description,
                }
              : undefined,
        },
        newIndex
      );

      if (result.success && result.data) {
        const data = result.data as {
          id: string;
          type: string;
          characterId?: string;
          text?: string;
          lighting?: { position: string; color: string; isOff?: boolean };
          sound?: { url: string; timecode: string; description?: string; isStop?: boolean };
          image?: { url: string; caption?: string };
          staging?: { item: string; position: string; description?: string };
          movement?: { characterId: string; from: string; to: string; description?: string };
        };
        
        const newItem = {
          id: data.id,
          type: data.type as "dialogue" | "narration" | "lighting" | "sound" | "image" | "staging" | "movement",
          character: data.characterId || undefined,
          text: data.text || undefined,
          lighting: data.lighting
            ? {
                position: data.lighting.position,
                color: data.lighting.color,
                isOff: data.lighting.isOff || false,
              }
            : undefined,
          sound: data.sound
            ? {
                url: data.sound.url,
                timecode: data.sound.timecode,
                description: data.sound.description || "",
                isStop: data.sound.isStop || false,
              }
            : undefined,
          image: data.image
            ? {
                url: data.image.url,
                caption: data.image.caption || "",
              }
            : undefined,
          staging: data.staging
            ? {
                item: data.staging.item,
                position: data.staging.position,
                description: data.staging.description || "",
              }
            : undefined,
          movement: data.movement
            ? {
                characterId: data.movement.characterId,
                from: data.movement.from,
                to: data.movement.to,
                description: data.movement.description || "",
              }
            : undefined,
        };

        setScript(prevScript => {
          const newScript = [...prevScript];
          newScript.splice(position === "after" ? targetIndex + 1 : targetIndex, 0, newItem);
          return newScript;
        });

        toast("Élément ajouté", {
          description: "L'élément a été ajouté avec succès",
        });
      }
    } catch (error) {
      toast.error("Erreur", {
        description: "Une erreur est survenue lors de l'ajout de l'élément",
      });
    } finally {
      setIsAddItemDialogOpen(false);
    }
  };

  const handleUpdateItem = async (updatedItem: typeof ScriptItemType) => {
    try {
      const result = await updateScriptItem(updatedItem.id, {
        type: updatedItem.type,
        text: updatedItem.text,
        characterId: updatedItem.character,
        lighting: updatedItem.lighting,
        sound: updatedItem.sound,
        image: updatedItem.image,
        staging: updatedItem.staging,
        movement:
          updatedItem.type === "movement"
            ? {
                characterId: updatedItem.movement?.characterId || "",
                from: updatedItem.movement?.from || "",
                to: updatedItem.movement?.to || "",
                description: updatedItem.movement?.description,
              }
            : undefined,
      });

      if (result.success) {
        setScript(script.map((item) => (item.id === updatedItem.id ? updatedItem : item)));
        toast("Élément mis à jour", {
          description: "L'élément a été mis à jour avec succès",
        });
      }
    } catch (error) {
      toast.error("Erreur", {
        description: "Une erreur est survenue lors de la mise à jour de l'élément",
      });
    } finally {
      setIsAddItemDialogOpen(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      const result = await deleteScriptItem(id);

      if (result.success) {
        setScript(script.filter((item) => item.id !== id));
        toast("Élément supprimé", {
          description: "L'élément a été supprimé avec succès",
        });
      }
    } catch (error) {
      toast.error("Erreur", {
        description: "Une erreur est survenue lors de la suppression de l'élément",
      });
    } finally {
      setIsAddItemDialogOpen(false);
    }
  };

  const handleSelectItem = (id: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedItems([...selectedItems, id]);
    } else {
      setSelectedItems(selectedItems.filter((itemId) => itemId !== id));
    }
  };

  const handleDeleteSelected = async () => {
    try {
      const deletePromises = selectedItems.map((id) => deleteScriptItem(id));
      const results = await Promise.all(deletePromises);

      const allSuccessful = results.every((result) => result.success);

      if (allSuccessful) {
        setScript(script.filter((item) => !selectedItems.includes(item.id)));
        setSelectedItems([]);
        toast("Éléments supprimés", {
          description: "Les éléments sélectionnés ont été supprimés avec succès",
        });
      }
    } catch (error) {
      toast.error("Erreur", {
        description: "Une erreur est survenue lors de la suppression des éléments sélectionnés",
      });
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = script.findIndex((item) => item.id === active.id);
      const newIndex = script.findIndex((item) => item.id === over?.id);

      const newItems = arrayMove(script, oldIndex, newIndex);
      setScript(newItems);

      try {
        const itemIds = newItems.map((item) => item.id);
        const result = await reorderScriptItems(scriptId, itemIds);

        if (!result.success) {
          setScript(script);
          toast.error("Erreur", {
            description: "Une erreur est survenue lors de la réorganisation des éléments",
          });
        }
      } catch (error) {
        setScript(script);
        toast.error("Erreur", {
          description: "Une erreur est survenue lors de la réorganisation des éléments",
        });
      } finally {
        setIsAddItemDialogOpen(false);
      }
    }
  };

  const exportScript = () => {
    const dataStr = JSON.stringify({ script, characters }, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;

    const exportFileDefaultName = `theatre-script-${new Date().toISOString().slice(0, 10)}.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  const importScript = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const idToast = toast.loading("Importation en cours...");
    
    startTransition(async () => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const content = e.target?.result as string;
          const parsed = JSON.parse(content);
          
          // Créer un mappage entre les anciens et nouveaux IDs de personnages
          const characterIdMap = new Map<string, string>();

          if (parsed.characters && Array.isArray(parsed.characters)) {
            toast.loading("Suppression des éléments existants...", { id: idToast });
            await deleteAllScriptItems(scriptId);
            toast.success("Suppression des éléments existants terminée", { id: idToast });

            const createPromises = parsed.characters.map((char: any) => {
              const { id, ...charData } = char;
              return { oldId: id, promise: createCharacter(scriptId, charData) };
            });
            
            toast.loading("Création des personnages...", { id: idToast });
            const results = await Promise.all(createPromises.map((item: { promise: Promise<any>; oldId: string }) => item.promise));
            
            // Construire le mappage id ancien -> id nouveau
            results.forEach((result, index) => {
              if (result.success && result.data) {
                const oldId = createPromises[index].oldId;
                const newData = result.data as { id: string; realName: string; stageName: string; role: string; color: string };
                characterIdMap.set(oldId, newData.id);
              }
            });
            console.log({characterIdMap});
            
            toast.success("Création des personnages...", { id: idToast });

            const newCharacters = results
              .filter((result) => result.success && result.data)
              .map((result) => {
                const data = result.data as { id: string; realName: string; stageName: string; role: string; color: string };
                return {
                  id: data.id,
                  realName: data.realName,
                  stageName: data.stageName,
                  role: data.role,
                  color: data.color,
                } as typeof Character;
              });

            setCharacters(newCharacters);
          }

          if (parsed.script && Array.isArray(parsed.script)) {
            toast.loading("Création des éléments...", { id: idToast });
            const newItems: (typeof ScriptItemType)[] = [];
            for (let i = 0; i < parsed.script.length; i++) {
              const item = parsed.script[i];
              
              // Mettre à jour les references de characterId
              const updatedCharacterId = item.character && characterIdMap.has(item.character) 
                ? characterIdMap.get(item.character) 
                : item.character;

              console.log({updatedCharacterId});
              
              // Mettre à jour les references de characterId dans les mouvements
              let updatedMovement = item.movement;
              if (item.type === "movement" && item.movement?.characterId && characterIdMap.has(item.movement.characterId)) {
                updatedMovement = {
                  ...item.movement,
                  characterId: characterIdMap.get(item.movement.characterId) || item.movement.characterId
                };
              }

              const apiItem = {
                type: item.type,
                text: item.text,
                characterId: updatedCharacterId,
                lighting: item.lighting,
                sound: item.sound,
                image: item.image,
                staging: item.staging,
                movement: updatedMovement 
                  ? {
                      characterId: updatedMovement.characterId || "",
                      from: updatedMovement.from || "",
                      to: updatedMovement.to || "",
                      description: updatedMovement.description,
                    }
                  : undefined,
              };

              toast.loading(`Création de l'élement ${i + 1} sur ${parsed.script.length}`, { id: idToast });
              const result = await createScriptItem(scriptId, apiItem, i);

              if (result.success && result.data) {
                const data = result.data as {
                  id: string;
                  type: string;
                  characterId?: string;
                  text?: string;
                  lighting?: { position: string; color: string; isOff?: boolean };
                  sound?: { url: string; timecode: string; description?: string; isStop?: boolean };
                  image?: { url: string; caption?: string };
                  staging?: { item: string; position: string; description?: string };
                  movement?: { characterId: string; from: string; to: string; description?: string };
                };
                const newItem: typeof ScriptItemType = {
                  id: data.id,
                  type: data.type as "dialogue" | "narration" | "lighting" | "sound" | "image" | "staging" | "movement",
                  character: data.characterId || undefined,
                  text: data.text || undefined,
                  lighting: data.lighting
                    ? {
                        position: data.lighting.position,
                        color: data.lighting.color,
                        isOff: data.lighting.isOff || false,
                      }
                    : undefined,
                  sound: data.sound
                    ? {
                        url: data.sound.url,
                        timecode: data.sound.timecode,
                        description: data.sound.description || "",
                        isStop: data.sound.isStop || false,
                      }
                    : undefined,
                  image: data.image
                    ? {
                        url: data.image.url,
                        caption: data.image.caption,
                      }
                    : undefined,
                  staging: data.staging
                    ? {
                        item: data.staging.item,
                        position: data.staging.position,
                        description: data.staging.description,
                      }
                    : undefined,
                  movement: data.movement
                    ? {
                        characterId: data.movement.characterId,
                        from: data.movement.from,
                        to: data.movement.to,
                        description: data.movement.description,
                      }
                    : undefined,
                };

                newItems.push(newItem);
              }
            }

            setScript(newItems);
          }

          toast.success("Import réussi", {
            description: "Le script a été importé avec succès",
            id: idToast,
          });
          router.refresh();
        } catch (error) {
          toast.error("Erreur", {
            description: "Le fichier importé n'est pas valide.",
            id: idToast,
          });
        } finally {
          setIsAddItemDialogOpen(false);
        }
      };
      reader.readAsText(file);
    });

    event.target.value = "";
  };

  const getCharacterColor = (characterId: string) => {
    const character = characters.find((c) => c.id === characterId);
    return character?.color || "#e2e8f0";
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Éditeur de Pièce de Théâtre</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsCharactersDialogOpen(true)}>
            <UsersIcon />
            Personnages
          </Button>
          <Button variant="outline" onClick={exportScript}>
            <DownloadIcon />
            Exporter
          </Button>
          <div className="relative">
            <Button variant="outline" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2Icon className="animate-spin" />
                  Importation...
                </>
              ) : (
                <>
                  <UploadIcon />
                  Importer
                </>
              )}
              <input 
                type="file" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                accept=".json" 
                onChange={importScript} 
                disabled={isPending}
              />
            </Button>
          </div>
          <Link href={`/scripts/${scriptId}/apercu`} passHref>
            <Button variant="outline">
              <EyeIcon className="mr-2 h-4 w-4" />
              Aperçu
            </Button>
          </Link>
          <ScriptPDFGenerator script={script} characters={characters} />
        </div>
      </div>

      <Card className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Contenu du script</h2>
          <div className="flex gap-2">
            {selectedItems.length > 0 && (
              <Button variant="destructive" onClick={handleDeleteSelected}>
                <Trash2Icon />
                Supprimer ({selectedItems.length})
              </Button>
            )}
            <Button onClick={() => setIsAddItemDialogOpen(true)}>
              <PlusIcon />
              Ajouter un élément
            </Button>
          </div>
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd} modifiers={[restrictToVerticalAxis]}>
          <SortableContext items={script.map((item) => item.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {script.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {`Aucun élément dans le script. Cliquez sur "Ajouter un élément" pour commencer.`}
                </div>
              ) : (
                script.map((item) => (
                  <ScriptItem
                    key={item.id}
                    item={item}
                    characters={characters}
                    characterColor={getCharacterColor(item.character || "")}
                    onUpdate={handleUpdateItem}
                    onDelete={handleDeleteItem}
                    onAddBefore={(newItem) => handleAddItemAtPosition(newItem, item.id, "before")}
                    onAddAfter={(newItem) => handleAddItemAtPosition(newItem, item.id, "after")}
                    isSelected={selectedItems.includes(item.id)}
                    onSelect={(isSelected) => handleSelectItem(item.id, isSelected)}
                    existingLightings={getExistingLightings()}
                    existingSounds={getExistingSounds()}
                  />
                ))
              )}
            </div>
          </SortableContext>
        </DndContext>
      </Card>

      <AddItemDialog
        open={isAddItemDialogOpen}
        onOpenChange={setIsAddItemDialogOpen}
        onAdd={handleAddItem}
        characters={characters}
        existingLightings={getExistingLightings()}
        existingSounds={getExistingSounds()}
      />

      {isCharactersDialogOpen && (
        <CharactersDialog
          open={isCharactersDialogOpen}
          onOpenChange={setIsCharactersDialogOpen}
          characters={characters}
          setCharacters={setCharacters}
          scriptId={scriptId}
        />
      )}
    </div>
  );
}
