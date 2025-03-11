"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Character, ScriptItemType } from "./script-editor";

interface AddItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (item: ScriptItemType) => void;
  characters: Character[];
}

export default function AddItemDialog({ open, onOpenChange, onAdd, characters }: AddItemDialogProps) {
  const [itemType, setItemType] = useState<"dialogue" | "narration" | "lighting" | "sound" | "image" | "staging" | "movement">("dialogue");
  const [character, setCharacter] = useState<string>("");
  const [text, setText] = useState<string>("");
  const [lightPosition, setLightPosition] = useState<string>("");
  const [lightColor, setLightColor] = useState<string>("#ffffff");
  const [soundUrl, setSoundUrl] = useState<string>("");
  const [soundTimecode, setSoundTimecode] = useState<string>("");
  const [soundDescription, setSoundDescription] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [imageCaption, setImageCaption] = useState<string>("");
  const [stagingItem, setStagingItem] = useState<string>("");
  const [stagingPosition, setStagingPosition] = useState<string>("");
  const [stagingDescription, setStagingDescription] = useState<string>("");
  const [movementCharacter, setMovementCharacter] = useState<string>("");
  const [movementFrom, setMovementFrom] = useState<string>("");
  const [movementTo, setMovementTo] = useState<string>("");
  const [movementDescription, setMovementDescription] = useState<string>("");

  /**
   * Reset all form fields to their default values
   */
  const resetForm = () => {
    setItemType("dialogue");
    setCharacter("");
    setText("");
    setLightPosition("");
    setLightColor("#ffffff");
    setSoundUrl("");
    setSoundTimecode("");
    setSoundDescription("");
    setImageUrl("");
    setImageCaption("");
    setStagingItem("");
    setStagingPosition("");
    setStagingDescription("");
    setMovementCharacter("");
    setMovementFrom("");
    setMovementTo("");
    setMovementDescription("");
  };

  /**
   * Handle form submission and create new script item
   */
  const handleSubmit = () => {
    const newItem: ScriptItemType = {
      id: Date.now().toString(),
      type: itemType,
    };

    switch (itemType) {
      case "dialogue":
        newItem.character = character;
        newItem.text = text;
        break;
      case "narration":
        newItem.character = character; // Allow narration to have a character
        newItem.text = text;
        break;
      case "lighting":
        newItem.lighting = {
          position: lightPosition,
          color: lightColor,
        };
        break;
      case "sound":
        newItem.sound = {
          url: soundUrl,
          timecode: soundTimecode,
          description: soundDescription,
        };
        break;
      case "image":
        newItem.image = {
          url: imageUrl,
          caption: imageCaption,
        };
        break;
      case "staging":
        newItem.staging = {
          item: stagingItem,
          position: stagingPosition,
          description: stagingDescription,
        };
        break;
      case "movement":
        newItem.movement = {
          character: movementCharacter,
          from: movementFrom,
          to: movementTo,
          description: movementDescription,
        };
        break;
    }

    onAdd(newItem);
    resetForm();
  };

  /**
   * Check if the form is valid based on current item type
   */
  const isFormValid = () => {
    switch (itemType) {
      case "dialogue":
        return character && text;
      case "narration":
        return text; // Character is optional for narration
      case "lighting":
        return lightPosition && lightColor;
      case "sound":
        return soundUrl && soundTimecode;
      case "image":
        return imageUrl;
      case "staging":
        return stagingItem && stagingPosition;
      case "movement":
        return movementCharacter && movementFrom && movementTo;
      default:
        return false;
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        if (!newOpen) resetForm();
        onOpenChange(newOpen);
      }}
    >
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Ajouter un élément au script</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="item-type">{`Type d'élément`}</Label>
            <Select
              value={itemType}
              onValueChange={(value) => setItemType(value as "dialogue" | "narration" | "lighting" | "sound" | "image" | "staging" | "movement")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un type d'élément" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dialogue">Dialogue</SelectItem>
                <SelectItem value="narration">Narration</SelectItem>
                <SelectItem value="lighting">Éclairage</SelectItem>
                <SelectItem value="sound">Son</SelectItem>
                <SelectItem value="image">Image</SelectItem>
                <SelectItem value="staging">Mise en scène</SelectItem>
                <SelectItem value="movement">Mouvement</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Fields specific to item type */}
          {(itemType === "dialogue" || itemType === "narration") && (
            <>
              <div className="space-y-2">
                <Label htmlFor="character">{itemType === "dialogue" ? "Personnage" : "Personnage (optionnel)"}</Label>
                <Select value={character} onValueChange={setCharacter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un personnage" />
                  </SelectTrigger>
                  <SelectContent>
                    {characters.length === 0 ? (
                      <SelectItem value="none" disabled>
                        Aucun personnage disponible
                      </SelectItem>
                    ) : (
                      characters.map((char) => (
                        <SelectItem key={char.id} value={char.id}>
                          {char.stageName} ({char.realName})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {characters.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    {`Ajoutez des personnages en cliquant sur le bouton "Personnages" en haut de la page.`}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="text">{itemType === "dialogue" ? "Texte du dialogue" : "Texte de narration"}</Label>
                <Textarea
                  id="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={itemType === "dialogue" ? "Entrez le texte du dialogue" : "Entrez le texte de narration"}
                  rows={4}
                />
              </div>
            </>
          )}

          {itemType === "lighting" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="light-position">{`Position de l'éclairage`}</Label>
                <Input
                  id="light-position"
                  value={lightPosition}
                  onChange={(e) => setLightPosition(e.target.value)}
                  placeholder="ex: Centre scène, Côté jardin, etc."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="light-color">Couleur</Label>
                <div className="flex gap-2">
                  <Input id="light-color" type="color" value={lightColor} onChange={(e) => setLightColor(e.target.value)} className="w-12 h-10 p-1" />
                  <Input value={lightColor} onChange={(e) => setLightColor(e.target.value)} placeholder="#FFFFFF" className="flex-1" />
                </div>
              </div>
            </>
          )}

          {itemType === "sound" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="sound-url">URL du son</Label>
                <Input id="sound-url" value={soundUrl} onChange={(e) => setSoundUrl(e.target.value)} placeholder="https://example.com/sound.mp3" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sound-timecode">Timecode</Label>
                <Input
                  id="sound-timecode"
                  value={soundTimecode}
                  onChange={(e) => setSoundTimecode(e.target.value)}
                  placeholder="ex: 00:15 ou 1m30s"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sound-description">Description</Label>
                <Input
                  id="sound-description"
                  value={soundDescription}
                  onChange={(e) => setSoundDescription(e.target.value)}
                  placeholder="ex: Bruit de tonnerre"
                />
              </div>
            </>
          )}

          {itemType === "image" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="image-url">{`URL de l'image`}</Label>
                <Input id="image-url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://example.com/image.jpg" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image-caption">Légende (optionnel)</Label>
                <Input
                  id="image-caption"
                  value={imageCaption}
                  onChange={(e) => setImageCaption(e.target.value)}
                  placeholder="Description de l'image"
                />
              </div>
            </>
          )}

          {itemType === "staging" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="staging-item">Élément</Label>
                <Input
                  id="staging-item"
                  value={stagingItem}
                  onChange={(e) => setStagingItem(e.target.value)}
                  placeholder="ex: Table, Chaise, Décor"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="staging-position">Position</Label>
                <Input
                  id="staging-position"
                  value={stagingPosition}
                  onChange={(e) => setStagingPosition(e.target.value)}
                  placeholder="ex: Centre scène, Avant-scène gauche"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="staging-description">Description (optionnel)</Label>
                <Textarea
                  id="staging-description"
                  value={stagingDescription}
                  onChange={(e) => setStagingDescription(e.target.value)}
                  placeholder="Détails supplémentaires sur le positionnement"
                  rows={3}
                />
              </div>
            </>
          )}

          {itemType === "movement" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="movement-character">Personnage</Label>
                <Select value={movementCharacter} onValueChange={setMovementCharacter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un personnage" />
                  </SelectTrigger>
                  <SelectContent>
                    {characters.length === 0 ? (
                      <SelectItem value="none" disabled>
                        Aucun personnage disponible
                      </SelectItem>
                    ) : (
                      characters.map((char) => (
                        <SelectItem key={char.id} value={char.id}>
                          {char.stageName} ({char.realName})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="movement-from">De</Label>
                <Input id="movement-from" value={movementFrom} onChange={(e) => setMovementFrom(e.target.value)} placeholder="ex: Coulisses jardin" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="movement-to">Vers</Label>
                <Input id="movement-to" value={movementTo} onChange={(e) => setMovementTo(e.target.value)} placeholder="ex: Centre scène" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="movement-description">Description (optionnel)</Label>
                <Textarea
                  id="movement-description"
                  value={movementDescription}
                  onChange={(e) => setMovementDescription(e.target.value)}
                  placeholder="ex: Marche lentement, en regardant autour"
                  rows={3}
                />
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={!isFormValid()}>
            Ajouter
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
