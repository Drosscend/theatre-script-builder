"use client";

import { createCharacter, deleteCharacter } from "@/app/actions/character";
import { createScriptItem, deleteScriptItem, reorderScriptItems, updateScriptItem } from "@/app/actions/script-item";
import { DndContext, DragEndEvent, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors } from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { SortableContext, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { DownloadIcon, PlusIcon, Trash2Icon, UploadIcon, UsersIcon } from "lucide-react";
import { toast } from "sonner";
import React from "react";
import { useState } from "react";
import AddItemDialog from "@/components/add-item-dialog";
import CharactersDialog from "@/components/characters-dialog";
import ScriptItem from "@/components/script-item";
import { ScriptPDFGenerator } from "@/components/script-pdf-generator";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
};

export const SoundEffect = {
  url: "",
  timecode: "",
  description: "",
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

  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor));

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
          lighting?: { position: string; color: string };
          sound?: { url: string; timecode: string; description?: string };
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
              }
            : undefined,
          sound: data.sound
            ? {
                url: data.sound.url,
                timecode: data.sound.timecode,
                description: data.sound.description || "",
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

        setScript([...script, newItem]);
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
          lighting?: { position: string; color: string };
          sound?: { url: string; timecode: string; description?: string };
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
              }
            : undefined,
          sound: data.sound
            ? {
                url: data.sound.url,
                timecode: data.sound.timecode,
                description: data.sound.description || "",
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

        const newItems = [...script];
        newItems.splice(newIndex, 0, newItem);
        setScript(newItems);

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

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);

        if (parsed.characters && Array.isArray(parsed.characters)) {
          const deletePromises = characters.map((char) => deleteCharacter(char.id));
          await Promise.all(deletePromises);

          const createPromises = parsed.characters.map((char: any) => {
            const { id, ...charData } = char;
            return createCharacter(scriptId, charData);
          });
          const results = await Promise.all(createPromises);

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
          const deletePromises = script.map((item) => deleteScriptItem(item.id));
          await Promise.all(deletePromises);

          const newItems: (typeof ScriptItemType)[] = [];
          for (let i = 0; i < parsed.script.length; i++) {
            const item = parsed.script[i];

            const apiItem = {
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
            };

            const result = await createScriptItem(scriptId, apiItem, i);

            if (result.success && result.data) {
              const data = result.data as {
                id: string;
                type: string;
                characterId?: string;
                text?: string;
                lighting?: { position: string; color: string };
                sound?: { url: string; timecode: string; description?: string };
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
                    }
                  : undefined,
                sound: data.sound
                  ? {
                      url: data.sound.url,
                      timecode: data.sound.timecode,
                      description: data.sound.description || "",
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

        toast("Import réussi", {
          description: "Le script a été importé avec succès",
        });
      } catch (error) {
        toast.error("Erreur", {
          description: "Le fichier importé n'est pas valide.",
        });
      } finally {
        setIsAddItemDialogOpen(false);
      }
    };
    reader.readAsText(file);

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
            <Button variant="outline">
              <UploadIcon />
              Importer
              <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept=".json" onChange={importScript} />
            </Button>
          </div>
          <ScriptPDFGenerator script={script} characters={characters} />
        </div>
      </div>

      <Tabs defaultValue="script" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="script">Script</TabsTrigger>
          <TabsTrigger value="preview">Aperçu</TabsTrigger>
        </TabsList>
        <TabsContent value="script" className="space-y-4">
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
                        characterColor={item.character ? getCharacterColor(item.character) : undefined}
                        onUpdate={handleUpdateItem}
                        onDelete={handleDeleteItem}
                        onAddBefore={(newItem) => handleAddItemAtPosition(newItem, item.id, "before")}
                        onAddAfter={(newItem) => handleAddItemAtPosition(newItem, item.id, "after")}
                        isSelected={selectedItems.includes(item.id)}
                        onSelect={(isSelected) => handleSelectItem(item.id, isSelected)}
                      />
                    ))
                  )}
                </div>
              </SortableContext>
            </DndContext>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Aperçu du script</h2>
            <div className="prose max-w-none">
              {script.map((item) => {
                const character = item.character ? characters.find((c) => c.id === item.character) : null;

                if (item.type === "dialogue" && character) {
                  const processedText = item.text;

                  return (
                    <div key={item.id} className="mb-4">
                      <p className="font-bold" style={{ color: character.color }}>
                        {`${character.stageName}:`}
                      </p>
                      <p className="ml-8">{processedText}</p>
                    </div>
                  );
                } else if (item.type === "narration") {
                  const processedText = item.text;

                  const narratorPrefix = character ? (
                    <span className="font-bold" style={{ color: character.color }}>
                      {`${character.stageName}: `}
                    </span>
                  ) : null;

                  return (
                    <div key={item.id} className="mb-4 italic">
                      {narratorPrefix}
                      <p>{processedText}</p>
                    </div>
                  );
                } else if (item.type === "lighting" && item.lighting) {
                  return (
                    <div key={item.id} className="mb-4 p-2 bg-slate-100 dark:bg-slate-800 rounded">
                      <p className="text-sm font-semibold">LUMIÈRE:</p>
                      <p className="text-sm">
                        Position: {`${item.lighting.position}`}, Couleur:{" "}
                        <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: item.lighting.color }}></span>{" "}
                        {`${item.lighting.color}`}
                      </p>
                    </div>
                  );
                } else if (item.type === "sound" && item.sound) {
                  return (
                    <div key={item.id} className="mb-4 p-2 bg-slate-100 dark:bg-slate-800 rounded">
                      <p className="text-sm font-semibold">SON:</p>
                      <p className="text-sm">
                        {`${item.sound.description}`} ({`${item.sound.timecode}`})
                      </p>
                      <p className="text-xs text-blue-500 underline">{`${item.sound.url}`}</p>
                    </div>
                  );
                } else if (item.type === "image" && item.image) {
                  return (
                    <div key={item.id} className="mb-4 p-2 bg-slate-100 dark:bg-slate-800 rounded">
                      <p className="text-sm font-semibold">IMAGE:</p>
                      <div className="my-2">
                        <div className="h-20 w-full flex items-center justify-center border rounded bg-gray-100">
                          <p className="text-gray-500">Image temporairement désactivée</p>
                        </div>
                      </div>
                      {item.image.caption && <p className="text-sm text-center italic mt-1">{`${item.image.caption}`}</p>}
                    </div>
                  );
                } else if (item.type === "staging" && item.staging) {
                  return (
                    <div key={item.id} className="mb-4 p-2 bg-slate-100 dark:bg-slate-800 rounded">
                      <p className="text-sm font-semibold">MISE EN SCÈNE - {`${item.staging.item}`}:</p>
                      <p className="text-sm">Position: {`${item.staging.position}`}</p>
                      {item.staging.description && <p className="text-sm italic mt-1">{`${item.staging.description}`}</p>}
                    </div>
                  );
                } else if (item.type === "movement" && item.movement) {
                  const movingCharacter = characters.find((c) => c.id === item.movement?.characterId);
                  return (
                    <div key={item.id} className="mb-4 p-2 bg-slate-100 dark:bg-slate-800 rounded">
                      <p className="text-sm font-semibold">MOUVEMENT:</p>
                      <p className="text-sm">
                        {`${movingCharacter?.stageName || "Personnage"}`}: {`${item.movement.from}`} → {`${item.movement.to}`}
                      </p>
                      {item.movement.description && <p className="text-sm italic mt-1">{`${item.movement.description}`}</p>}
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <AddItemDialog open={isAddItemDialogOpen} onOpenChange={setIsAddItemDialogOpen} onAdd={handleAddItem} characters={characters} />

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
