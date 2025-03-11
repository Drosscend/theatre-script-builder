"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Character, ScriptItemType } from "./script-editor";

const AddItemDialogProps = {
  open: false,
  onOpenChange: (open: boolean) => {},
  onAdd: (item: typeof ScriptItemType) => {},
  characters: [] as Array<
    typeof Character & {
      id: string;
      realName: string;
      stageName: string;
      role: string;
      color: string;
    }
  >,
  existingLightings: [] as Array<{
    id: string;
    position: string;
    color: string;
  }>,
  existingSounds: [] as Array<{
    id: string;
    url: string;
    timecode: string;
    description?: string;
  }>,
};

export default function AddItemDialog({ 
  open, 
  onOpenChange, 
  onAdd, 
  characters,
  existingLightings = [],
  existingSounds = []
}: typeof AddItemDialogProps) {
  const [itemType, setItemType] = useState<"dialogue" | "narration" | "lighting" | "sound" | "image" | "staging" | "movement">("dialogue");
  const [character, setCharacter] = useState<string>("");
  const [text, setText] = useState<string>("");
  const [lightPosition, setLightPosition] = useState<string>("");
  const [lightColor, setLightColor] = useState<string>("#ffffff");
  const [lightIsOff, setLightIsOff] = useState<boolean>(false);
  const [selectedLighting, setSelectedLighting] = useState<string>("");
  const [useExistingLighting, setUseExistingLighting] = useState<boolean>(false);
  const [soundUrl, setSoundUrl] = useState<string>("");
  const [soundTimecode, setSoundTimecode] = useState<string>("");
  const [soundDescription, setSoundDescription] = useState<string>("");
  const [soundIsStop, setSoundIsStop] = useState<boolean>(false);
  const [selectedSound, setSelectedSound] = useState<string>("");
  const [useExistingSound, setUseExistingSound] = useState<boolean>(false);
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
    setLightIsOff(false);
    setSelectedLighting("");
    setUseExistingLighting(false);
    setSoundUrl("");
    setSoundTimecode("");
    setSoundDescription("");
    setSoundIsStop(false);
    setSelectedSound("");
    setUseExistingSound(false);
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
   * Handle selection of existing lighting
   */
  const handleSelectLighting = (id: string) => {
    const lighting = existingLightings.find(l => l.id === id);
    if (lighting) {
      setLightPosition(lighting.position);
      setLightColor(lighting.color);
    }
    setSelectedLighting(id);
  };

  /**
   * Handle selection of existing sound
   */
  const handleSelectSound = (id: string) => {
    const sound = existingSounds.find(s => s.id === id);
    if (sound) {
      setSoundUrl(sound.url);
      setSoundTimecode(sound.timecode);
      setSoundDescription(sound.description || "");
    }
    setSelectedSound(id);
  };

  /**
   * Handle form submission and create new script item
   */
  const handleSubmit = () => {
    const newItem: typeof ScriptItemType = {
      id: Date.now().toString(),
      type: itemType,
      character: character || undefined,
      text: text || undefined,
      lighting:
        itemType === "lighting"
          ? {
              position: lightPosition,
              color: lightColor,
              isOff: lightIsOff,
            }
          : undefined,
      sound:
        itemType === "sound"
          ? {
              url: soundUrl,
              timecode: soundTimecode,
              description: soundDescription,
              isStop: soundIsStop,
            }
          : undefined,
      image:
        itemType === "image"
          ? {
              url: imageUrl,
              caption: imageCaption,
            }
          : undefined,
      staging:
        itemType === "staging"
          ? {
              item: stagingItem,
              position: stagingPosition,
              description: stagingDescription,
            }
          : undefined,
      movement:
        itemType === "movement"
          ? {
              characterId: movementCharacter,
              from: movementFrom,
              to: movementTo,
              description: movementDescription,
            }
          : undefined,
    };

    onAdd(newItem);
    resetForm();
    onOpenChange(false);
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
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="useExistingLighting"
                    checked={useExistingLighting}
                    onChange={(e) => setUseExistingLighting(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label htmlFor="useExistingLighting">Utiliser un éclairage existant</Label>
                </div>

                {useExistingLighting ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="selectedLighting">Éclairage existant</Label>
                      <Select value={selectedLighting} onValueChange={handleSelectLighting}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un éclairage existant" />
                        </SelectTrigger>
                        <SelectContent>
                          {existingLightings.map((lighting) => (
                            <SelectItem key={lighting.id} value={lighting.id}>
                              {lighting.position} - {lighting.color}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid w-full items-center gap-1.5">
                      <Label htmlFor="lightPosition">Position</Label>
                      <Input
                        id="lightPosition"
                        placeholder="Position de l'éclairage (scène, côté jardin, etc.)"
                        value={lightPosition}
                        onChange={(e) => setLightPosition(e.target.value)}
                      />
                    </div>
                    <div className="grid w-full items-center gap-1.5">
                      <Label htmlFor="lightColor">Couleur</Label>
                      <div className="flex gap-2">
                        <Input
                          id="lightColor"
                          type="color"
                          value={lightColor}
                          onChange={(e) => setLightColor(e.target.value)}
                          className="w-16 h-10"
                        />
                        <Input
                          value={lightColor}
                          onChange={(e) => setLightColor(e.target.value)}
                          className="flex-1"
                          placeholder="#FFFFFF"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="lightIsOff"
                    checked={lightIsOff}
                    onChange={(e) => setLightIsOff(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label htmlFor="lightIsOff">Éteindre la lumière</Label>
                </div>
              </div>
            </>
          )}

          {itemType === "sound" && (
            <>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="useExistingSound"
                    checked={useExistingSound}
                    onChange={(e) => setUseExistingSound(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label htmlFor="useExistingSound">Utiliser un son existant</Label>
                </div>

                {useExistingSound ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="selectedSound">Son existant</Label>
                      <Select value={selectedSound} onValueChange={handleSelectSound}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un son existant" />
                        </SelectTrigger>
                        <SelectContent>
                          {existingSounds.map((sound) => (
                            <SelectItem key={sound.id} value={sound.id}>
                              {sound.description || sound.url} - {sound.timecode}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid w-full items-center gap-1.5">
                      <Label htmlFor="soundUrl">URL du son</Label>
                      <Input
                        id="soundUrl"
                        placeholder="URL du fichier audio"
                        value={soundUrl}
                        onChange={(e) => setSoundUrl(e.target.value)}
                      />
                    </div>
                    <div className="grid w-full items-center gap-1.5">
                      <Label htmlFor="soundTimecode">Timecode</Label>
                      <Input
                        id="soundTimecode"
                        placeholder="Timecode (ex: 00:01:30)"
                        value={soundTimecode}
                        onChange={(e) => setSoundTimecode(e.target.value)}
                      />
                    </div>
                    <div className="grid w-full items-center gap-1.5">
                      <Label htmlFor="soundDescription">Description</Label>
                      <Input
                        id="soundDescription"
                        placeholder="Description du son"
                        value={soundDescription}
                        onChange={(e) => setSoundDescription(e.target.value)}
                      />
                    </div>
                  </>
                )}

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="soundIsStop"
                    checked={soundIsStop}
                    onChange={(e) => setSoundIsStop(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label htmlFor="soundIsStop">Arrêter la musique</Label>
                </div>
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
