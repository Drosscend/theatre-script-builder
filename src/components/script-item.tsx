"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { DiffIcon, EditIcon, GripVerticalIcon, Trash2Icon } from "lucide-react";
import { useState, memo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { AddItemDialog } from "./add-item-dialog";
import EditItemDialog from "./edit-item-dialog";
import { type ScriptItem as ScriptItemType, type ExistingLighting, type ExistingSound } from "@/lib/schema";
import { Character } from "@prisma/client";
import { type ScriptItemWithRelations } from "@/lib/types";

interface ScriptItemProps {
  item: ScriptItemWithRelations;
  characters: Character[];
  onUpdate: (item: ScriptItemType) => void;
  onDelete: (id: string) => void;
  onAddBefore: (item: ScriptItemType) => void;
  onAddAfter: (item: ScriptItemType) => void;
  isSelected: boolean;
  onSelect: (isSelected: boolean) => void;
  existingLightings: ExistingLighting[];
  existingSounds: ExistingSound[];
}

function ScriptItem({
  item,
  characters,
  onUpdate,
  onDelete,
  onAddBefore,
  onAddAfter,
  isSelected,
  onSelect,
  existingLightings = [],
  existingSounds = [],
}: ScriptItemProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddBeforeOpen, setIsAddBeforeOpen] = useState(false);
  const [isAddAfterOpen, setIsAddAfterOpen] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  /**
   * Get the display label for the script item based on its type
   */
  const getItemLabel = useCallback(() => {
    switch (item.type) {
      case "dialogue":
        const characterDialogue = item.dialogue?.characterId ? characters.find((c) => c.id === item.dialogue?.characterId) : undefined;
        return `Dialogue - ${characterDialogue?.stageName || "Personnage inconnu"}`;
      case "narration":
        const characterNarration = item.narration?.characterId ? characters.find((c) => c.id === item.narration?.characterId) : undefined;
        return `Narration - ${characterNarration?.stageName || "Personnage inconnu"}`;
      case "lighting":
        return "Éclairage";
      case "sound":
        return "Son";
      case "image":
        return "Image";
      case "staging":
        return "Mise en scène";
      case "movement":
        const movementCharacter = item.movement?.characterId 
          ? characters.find((c) => c.id === item.movement?.characterId) 
          : undefined;
        return `Mouvement - ${movementCharacter?.stageName || "Personnage inconnu"}`;
      default:
        return "Élément inconnu";
    }
  }, [item.type, characters]);

  /**
   * Get a preview text for the script item to display in the list
   */
  const getItemPreview = useCallback(() => {
    switch (item.type) {
      case "dialogue":
        return item.dialogue?.text || "";
      case "narration":
        return item.narration?.text || "";
      case "lighting":
        if (!item.id) return "Informations d'éclairage non disponibles";
        if (item.lighting?.isOff) return `Extinction des lumières à ${item.lighting?.position || ""}`;
        return `Position: ${item.lighting?.position || ""}, Couleur: ${item.lighting?.color || ""}`;
      case "sound":
        if (!item.id) return "Informations sonores non disponibles";
        if (item.sound?.isStop) return `Arrêt de la musique: ${item.sound?.description || ""}`;
        return `${item.sound?.description || ""} (${item.sound?.timecode || ""})`;
      case "image":
        if (!item.id) return "Informations d'image non disponibles";
        return `${item.image?.caption || "Image"} (${item.image?.width || "?"}x${item.image?.height || "?"})`;
      case "staging":
        if (!item.id) return "Informations de mise en scène non disponibles";
        return `${item.staging?.item || ""} - Position: ${item.staging?.position || ""} - ${item.staging?.description || ""}`;
      case "movement":
        if (!item.id) return "Informations de mouvement non disponibles";
        return `${item.movement?.from || ""} → ${item.movement?.to || ""}`;
      default:
        return "";
    }
  }, [item]);

  /**
   * Get the color for the item's border based on its type and associated character
   */
  const getBorderColor = useCallback(() => {
    switch (item.type) {
      case "narration":
        return "#94a3b8"; // slate-400
      case "dialogue":
        return "#fbbf24"; // amber-400
      case "lighting":
        return "#fbbf24"; // amber-400
      case "sound":
        return "#60a5fa"; // blue-400
      case "image":
        return "#a78bfa"; // violet-400
      case "staging":
        return "#34d399"; // emerald-400
      case "movement":
        return "#f472b6"; // pink-400
      default:
        return "#e2e8f0"; // slate-200
    }
  }, [item.type]);

  const handleDelete = useCallback(() => {
    onDelete(item.id);
  }, [item.id, onDelete]);

  const handleOpenEditDialog = useCallback(() => {
    setIsEditOpen(true);
  }, []);

  const handleOpenAddBeforeDialog = useCallback(() => {
    setIsAddBeforeOpen(true);
  }, []);

  const handleOpenAddAfterDialog = useCallback(() => {
    setIsAddAfterOpen(true);
  }, []);

  return (
    <>
      <Card
        ref={setNodeRef}
        style={{
          ...style,
          borderLeft: `4px solid ${getBorderColor()}`,
        }}
        className="shadow-sm hover:shadow transition-shadow"
      >
        <CardContent className="px-4 flex items-start gap-2">
          <div className="flex items-center gap-0.5 mt-1">
            <Checkbox checked={isSelected} onCheckedChange={onSelect} />
            <div className="cursor-move touch-none p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800" {...attributes} {...listeners}>
              <GripVerticalIcon className="size-5 text-muted-foreground" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm">{getItemLabel()}</div>
            <div className="text-sm text-muted-foreground truncate">{getItemPreview()}</div>
          </div>

          <div className="flex shrink-0">
            <Button variant="ghost" size="icon" title="Ajouter avant" onClick={handleOpenAddBeforeDialog}>
              <DiffIcon />
            </Button>
            <Button variant="ghost" size="icon" title="Ajouter après" onClick={handleOpenAddAfterDialog}>
              <DiffIcon className="rotate-180" />
            </Button>
            <Button variant="ghost" size="icon" title="Modifier" onClick={handleOpenEditDialog}>
              <EditIcon />
            </Button>
            <Button variant="ghost" size="icon" title="Supprimer" onClick={handleDelete}>
              <Trash2Icon />
            </Button>
          </div>
        </CardContent>
      </Card>

      <EditItemDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        item={item}
        characters={characters}
        onUpdate={onUpdate}
        existingLightings={existingLightings}
        existingSounds={existingSounds}
      />

      <AddItemDialog 
        open={isAddBeforeOpen} 
        onOpenChange={setIsAddBeforeOpen} 
        onAdd={onAddBefore} 
        characters={characters}
        existingLightings={existingLightings}
        existingSounds={existingSounds}
      />

      <AddItemDialog 
        open={isAddAfterOpen} 
        onOpenChange={setIsAddAfterOpen} 
        onAdd={onAddAfter} 
        characters={characters}
        existingLightings={existingLightings}
        existingSounds={existingSounds}
      />
    </>
  );
}

export default memo(ScriptItem, (prevProps, nextProps) => {
  return (
    prevProps.item.id === nextProps.item.id &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.item.type === nextProps.item.type &&
    JSON.stringify(prevProps.item) === JSON.stringify(nextProps.item) &&
    prevProps.characters.length === nextProps.characters.length
  );
});
