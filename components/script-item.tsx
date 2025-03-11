"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { DiffIcon, EditIcon, GripVerticalIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import AddItemDialog from "./add-item-dialog";
import EditItemDialog from "./edit-item-dialog";
import { Character, ScriptItemType } from "./script-editor";

interface ScriptItemProps {
  item: typeof ScriptItemType & {
    id: string;
    type: "dialogue" | "narration" | "lighting" | "sound" | "image" | "staging" | "movement";
  };
  characters: Array<typeof Character & {
    id: string;
    realName: string;
    stageName: string;
    role: string;
    color: string;
  }>;
  characterColor?: string;
  onUpdate: (item: typeof ScriptItemType) => void;
  onDelete: (id: string) => void;
  onAddBefore: (item: typeof ScriptItemType) => void;
  onAddAfter: (item: typeof ScriptItemType) => void;
  isSelected: boolean;
  onSelect: (isSelected: boolean) => void;
}

export default function ScriptItem({
  item,
  characters,
  characterColor,
  onUpdate,
  onDelete,
  onAddBefore,
  onAddAfter,
  isSelected,
  onSelect,
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
  const getItemLabel = () => {
    switch (item.type) {
      case "dialogue":
        const character = characters.find((c: typeof Character) => c.id === item.character);
        return `Dialogue - ${character?.stageName || "Personnage inconnu"}`;
      case "narration":
        return "Narration";
      case "lighting":
        return "Éclairage";
      case "sound":
        return "Son";
      case "image":
        return "Image";
      case "staging":
        return "Mise en scène";
      case "movement":
        const movementCharacter = characters.find((c: typeof Character) => c.id === item.movement?.characterId);
        return `Mouvement - ${movementCharacter?.stageName || "Personnage inconnu"}`;
      default:
        return "Élément inconnu";
    }
  };

  /**
   * Get a preview text for the script item to display in the list
   */
  const getItemPreview = () => {
    switch (item.type) {
      case "dialogue":
        return item.text;
      case "narration":
        return item.text;
      case "lighting":
        return `Position: ${item.lighting?.position}, Couleur: ${item.lighting?.color}`;
      case "sound":
        return `${item.sound?.description} (${item.sound?.timecode})`;
      case "image":
        return item.image?.caption || item.image?.url;
      case "staging":
        return `${item.staging?.item} - Position: ${item.staging?.position}`;
      case "movement":
        return `${item.movement?.from} → ${item.movement?.to}`;
      default:
        return "";
    }
  };

  /**
   * Get the color for the item's border based on its type and associated character
   */
  const getBorderColor = () => {
    if (item.type === "dialogue" && characterColor) {
      return characterColor;
    }

    switch (item.type) {
      case "narration":
        return "#94a3b8"; // slate-400
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
  };

  const props = {
    isSelected,
    onSelect,
  };

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
        <CardContent className="p-4 flex items-start gap-2">
          <div className="flex items-center gap-2">
            <Checkbox checked={props.isSelected} onCheckedChange={props.onSelect} className="mt-1" />
            <div className="cursor-move touch-none p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800" {...attributes} {...listeners}>
              <GripVerticalIcon className="size-5 text-muted-foreground" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm">{getItemLabel()}</div>
            <div className="text-sm text-muted-foreground truncate">{getItemPreview()}</div>
          </div>

          <div className="flex gap-1 shrink-0">
            <Button variant="ghost" size="icon" title="Ajouter avant" onClick={() => setIsAddBeforeOpen(true)}>
              <DiffIcon />
            </Button>
            <Button variant="ghost" size="icon" title="Ajouter après" onClick={() => setIsAddAfterOpen(true)}>
              <DiffIcon className="rotate-180" />
            </Button>
            <Button variant="ghost" size="icon" title="Modifier" onClick={() => setIsEditOpen(true)}>
              <EditIcon />
            </Button>
            <Button variant="ghost" size="icon" title="Supprimer" onClick={() => onDelete(item.id)}>
              <Trash2Icon />
            </Button>
          </div>
        </CardContent>
      </Card>

      <EditItemDialog open={isEditOpen} onOpenChange={setIsEditOpen} item={item} characters={characters} onUpdate={onUpdate} />

      <AddItemDialog open={isAddBeforeOpen} onOpenChange={setIsAddBeforeOpen} onAdd={onAddBefore} characters={characters} />

      <AddItemDialog open={isAddAfterOpen} onOpenChange={setIsAddAfterOpen} onAdd={onAddAfter} characters={characters} />
    </>
  );
}
