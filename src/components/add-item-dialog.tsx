"use client";

import { useState, useCallback, memo } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Character, ScriptItemType } from "./script-editor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

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

const AddItemDialog = memo(function AddItemDialog({ 
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
  const [soundType, setSoundType] = useState<"url" | "base64" | "youtube">("url");
  const [soundName, setSoundName] = useState<string>("");
  const [soundFile, setSoundFile] = useState<File | null>(null);
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
  const [imageType, setImageType] = useState<"url" | "base64">("url");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [imageWidth, setImageWidth] = useState<number>(800);
  const [imageHeight, setImageHeight] = useState<number>(600);

  /**
   * Reset all form fields to their default values
   */
  const resetForm = useCallback(() => {
    setItemType("dialogue");
    setCharacter("");
    setText("");
    setLightPosition("");
    setLightColor("#ffffff");
    setLightIsOff(false);
    setSelectedLighting("");
    setUseExistingLighting(false);
    setSoundUrl("");
    setSoundType("url");
    setSoundName("");
    setSoundFile(null);
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
    setImageType("url");
    setImageFile(null);
    setImagePreview("");
    setImageWidth(800);
    setImageHeight(600);
  }, []);

  /**
   * Handle selection of existing lighting
   */
  const handleSelectLighting = useCallback((id: string) => {
    const lighting = existingLightings.find(l => l.id === id);
    if (lighting) {
      setLightPosition(lighting.position);
      setLightColor(lighting.color);
    }
    setSelectedLighting(id);
  }, [existingLightings]);

  /**
   * Handle selection of existing sound
   */
  const handleSelectSound = useCallback((id: string) => {
    const sound = existingSounds.find(s => s.id === id);
    if (sound) {
      setSoundUrl(sound.url);
      setSoundTimecode(sound.timecode);
      if (sound.description) {
        setSoundDescription(sound.description);
      }
      setSoundName(sound.url.split('/').pop() || '');
    }
    setSelectedSound(id);
  }, [existingSounds]);

  /**
   * Handle image file selection and conversion to base64
   */
  const handleImageFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error("Erreur", {
        description: "Le fichier doit être une image",
      });
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Erreur", {
        description: "L'image ne doit pas dépasser 5MB",
      });
      return;
    }

    setImageFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  /**
   * Convert image to base64 with size constraints
   */
  const convertImageToBase64 = useCallback(async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate aspect ratio
        const aspectRatio = width / height;

        // Resize if needed
        if (width > imageWidth) {
          width = imageWidth;
          height = width / aspectRatio;
        }
        if (height > imageHeight) {
          height = imageHeight;
          width = height * aspectRatio;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }, [imageWidth, imageHeight]);

  /**
   * Convert sound to base64
   */
  const convertSoundToBase64 = useCallback(async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }, []);

  /**
   * Handle form submission and create new script item
   */
  const handleSubmit = useCallback(async () => {
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
              type: soundType,
              name: soundName,
              timecode: soundTimecode,
              description: soundDescription,
              isStop: soundIsStop,
            }
          : undefined,
      image:
        itemType === "image"
          ? {
              url: imageType === "url" ? imageUrl : (await convertImageToBase64(imageFile!)),
              caption: imageCaption,
              width: imageWidth,
              height: imageHeight,
              type: imageType,
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
  }, [itemType, character, text, lightPosition, lightColor, lightIsOff, soundUrl, soundType, soundName, soundTimecode, soundDescription, soundIsStop, imageUrl, imageCaption, imageType, imageFile, imageWidth, imageHeight, stagingItem, stagingPosition, stagingDescription, movementCharacter, movementFrom, movementTo, movementDescription, onAdd, resetForm, onOpenChange, convertImageToBase64, convertSoundToBase64]);

  /**
   * Check if the form is valid based on current item type
   */
  const isFormValid = useCallback(() => {
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
        return imageType === "url" ? imageUrl : (imageType === "base64" && imageFile);
      case "staging":
        return stagingItem && stagingPosition;
      case "movement":
        return movementCharacter && movementFrom && movementTo;
      default:
        return false;
    }
  }, [itemType, character, text, lightPosition, lightColor, soundUrl, soundTimecode, imageUrl, imageType, imageFile, stagingItem, stagingPosition, movementCharacter, movementFrom, movementTo]);

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
                              {sound.description || sound.url}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                ) : (
                  <Tabs value={soundType} onValueChange={(value) => setSoundType(value as "url" | "base64" | "youtube")}>
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="url">URL</TabsTrigger>
                      <TabsTrigger value="youtube">YouTube</TabsTrigger>
                      <TabsTrigger value="base64">Fichier</TabsTrigger>
                    </TabsList>
                    <TabsContent value="url">
                      <div className="space-y-2">
                        <Label htmlFor="sound-url">URL du son</Label>
                        <Input
                          id="sound-url"
                          value={soundUrl}
                          onChange={(e) => setSoundUrl(e.target.value)}
                          placeholder="https://example.com/sound.mp3"
                        />
                      </div>
                    </TabsContent>
                    <TabsContent value="youtube">
                      <div className="space-y-2">
                        <Label htmlFor="sound-youtube">URL YouTube</Label>
                        <Input
                          id="sound-youtube"
                          value={soundUrl}
                          onChange={(e) => setSoundUrl(e.target.value)}
                          placeholder="https://www.youtube.com/watch?v=..."
                        />
                      </div>
                    </TabsContent>
                    <TabsContent value="base64">
                      <div className="space-y-2">
                        <Label htmlFor="sound-base64">Sélectionner un fichier audio</Label>
                        <Input
                          id="sound-base64"
                          type="file"
                          accept="audio/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;

                            // Vérifier la taille du fichier (max 10MB)
                            if (file.size > 10 * 1024 * 1024) {
                              toast.error("Erreur", {
                                description: "Le fichier ne doit pas dépasser 10MB",
                              });
                              return;
                            }

                            const base64 = await convertSoundToBase64(file);
                            setSoundUrl(base64);
                            setSoundName(file.name);
                          }}
                        />
                      </div>
                    </TabsContent>
                  </Tabs>
                )}

                <div className="space-y-2">
                  <Label htmlFor="sound-name">Nom du son</Label>
                  <Input
                    id="sound-name"
                    value={soundName}
                    onChange={(e) => setSoundName(e.target.value)}
                    placeholder="Nom ou titre de la musique"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sound-timecode">Timecode</Label>
                  <Input
                    id="sound-timecode"
                    value={soundTimecode}
                    onChange={(e) => setSoundTimecode(e.target.value)}
                    placeholder="00:00:00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sound-description">Description</Label>
                  <Input
                    id="sound-description"
                    value={soundDescription}
                    onChange={(e) => setSoundDescription(e.target.value)}
                    placeholder="Description du son"
                  />
                </div>

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
              <div className="space-y-4">
                <Tabs value={imageType} onValueChange={(value) => setImageType(value as "url" | "base64")}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="url">URL</TabsTrigger>
                    <TabsTrigger value="base64">Image locale</TabsTrigger>
                  </TabsList>
                  <TabsContent value="url">
                    <div className="space-y-2">
                      <Label htmlFor="image-url">URL de l'image</Label>
                      <Input
                        id="image-url"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                  </TabsContent>
                  <TabsContent value="base64">
                    <div className="space-y-2">
                      <Label htmlFor="image-file">Sélectionner une image</Label>
                      <Input
                        id="image-file"
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                      />
                      {imagePreview && (
                        <div className="mt-2">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="max-w-full h-auto rounded-lg"
                          />
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="image-width">Largeur (px)</Label>
                    <Input
                      id="image-width"
                      type="number"
                      value={imageWidth}
                      onChange={(e) => setImageWidth(Number(e.target.value))}
                      min={100}
                      max={2000}
                      step={100}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="image-height">Hauteur (px)</Label>
                    <Input
                      id="image-height"
                      type="number"
                      value={imageHeight}
                      onChange={(e) => setImageHeight(Number(e.target.value))}
                      min={100}
                      max={2000}
                      step={100}
                    />
                  </div>
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
});

export default AddItemDialog;
