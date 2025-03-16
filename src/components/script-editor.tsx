"use client";

import { createScriptItem, deleteScriptItem, reorderScriptItems, updateScriptItem } from "@/app/actions/script-item";
import { DndContext, DragEndEvent, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors } from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { SortableContext, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { DownloadIcon, PlusIcon, Trash2Icon, UploadIcon, UsersIcon, Loader2Icon, EyeIcon } from "lucide-react";
import { toast } from "sonner";
import React from "react";
import { useState, useTransition } from "react";
import { AddItemDialog } from "@/components/add-item-dialog";
import CharactersDialog from "@/components/characters-dialog";
import ScriptItem from "@/components/script-item";
import { ScriptPDFGenerator } from "@/components/script-pdf-generator";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ImportScriptDialog } from "@/components/import-script-dialog";
import { DeleteScriptButton } from "./delete-script-button";
import { type ScriptItem as ScriptItemType } from "@/lib/schema";
import { Character } from "@prisma/client";
import type { ScriptItemWithRelations, ScriptWithRelations } from "@/lib/types";


interface ScriptEditorProps {
  initialScript: ScriptWithRelations;
  scriptId: string;
  scriptName: string;
}

export function ScriptEditor({ initialScript, scriptId, scriptName }: ScriptEditorProps) {
  const [script, setScript] = useState<ScriptItemWithRelations[]>(initialScript.items);
  const [characters, setCharacters] = useState<Character[]>(initialScript.characters);
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);
  const [isCharactersDialogOpen, setIsCharactersDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
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

  const handleAddItem = async (item: ScriptItemType) => {
    try {
      const result = await createScriptItem(scriptId, item);

      if (result.success && result.data) {
        setScript(prevScript => [...prevScript, result.data as ScriptItemWithRelations]);
        
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

  const handleAddItemAtPosition = async (item: ScriptItemType, targetId: string, position: "before" | "after") => {
    const targetIndex = script.findIndex((item) => item.id === targetId);
    if (targetIndex === -1) return;

    try {
      const newIndex = position === "after" ? targetIndex + 1 : targetIndex;

      const result = await createScriptItem(
        scriptId,
        item,
        newIndex
      );

      if (result.success && result.data) {  
        setScript(prevScript => {
          const newScript = [...prevScript];
          newScript.splice(position === "after" ? targetIndex + 1 : targetIndex, 0, result.data as ScriptItemWithRelations);
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

  const handleUpdateItem = async (updatedItem: ScriptItemType) => {
    try {
      const result = await updateScriptItem(updatedItem.id, updatedItem);
      if (result.success && result.data) {
        setScript(script.map((item) => (item.id === updatedItem.id ? result.data as ScriptItemWithRelations : item)));
        toast("Élément mis à jour", {
          description: "L'élément a été mis à jour avec succès",
        });
      }
    } catch (error) {
      toast.error("Erreur", {
        description: "Une erreur est survenue lors de la mise à jour de l'élément",
      });
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

  const handleImportComplete = (data: ScriptWithRelations) => {
    setScript(data.items);
    setCharacters(data.characters);
    router.refresh();
  };

  const getCharacterColor = (characterId: string) => {
    const character = characters.find((c) => c.id === characterId);
    return character?.color || "#e2e8f0";
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold">{scriptName}</h1>
        <div className="flex flex-wrap gap-2 justify-center">
          <Button variant="outline" onClick={() => setIsCharactersDialogOpen(true)}>
            <UsersIcon />
            Personnages
          </Button>
          <Button variant="outline" onClick={exportScript}>
            <DownloadIcon />
            Exporter
          </Button>
          <Button variant="outline" onClick={() => setIsImportDialogOpen(true)}>
            <UploadIcon />
            Importer
          </Button>
          <Link href={`/scripts/${scriptId}/apercu`} passHref>
            <Button variant="outline">
              <EyeIcon />
              Aperçu
            </Button>
          </Link>
          <ScriptPDFGenerator script={initialScript} />
          <DeleteScriptButton scriptId={scriptId} scriptName={scriptName} />
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

      <ImportScriptDialog
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        scriptId={scriptId}
        onImportComplete={handleImportComplete}
      />
    </div>
  );
}
