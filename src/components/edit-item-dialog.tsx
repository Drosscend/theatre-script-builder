"use client";

import { useEffect, useState, useCallback, memo } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Character, ScriptItemType } from "./script-editor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const EditItemDialogProps = {
  open: false,
  onOpenChange: (open: boolean) => {},
  item: {} as typeof ScriptItemType & {
    id: string;
    type: "dialogue" | "narration" | "lighting" | "sound" | "image" | "staging" | "movement";
  },
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
  onUpdate: (item: typeof ScriptItemType) => {},
};

const EditItemDialog = memo(function EditItemDialog({ 
  open, 
  onOpenChange, 
  item, 
  characters, 
  existingLightings = [],
  existingSounds = [],
  onUpdate 
}: typeof EditItemDialogProps) {
  const [itemType, setItemType] = useState<"dialogue" | "narration" | "lighting" | "sound" | "image" | "staging" | "movement">(item.type);
  const [character, setCharacter] = useState<string>(item.character || "");
  const [text, setText] = useState<string>(item.text || "");
  const [lightPosition, setLightPosition] = useState<string>(item.lighting?.position || "");
  const [lightColor, setLightColor] = useState<string>(item.lighting?.color || "#ffffff");
  const [lightIsOff, setLightIsOff] = useState<boolean>(item.lighting?.isOff || false);
  const [selectedLighting, setSelectedLighting] = useState<string>("");
  const [useExistingLighting, setUseExistingLighting] = useState<boolean>(false);
  const [soundUrl, setSoundUrl] = useState<string>(item.sound?.url || "");
  const [soundType, setSoundType] = useState<"url" | "base64" | "youtube">(item.sound?.type || "url");
  const [soundName, setSoundName] = useState<string>(item.sound?.name || "");
  const [soundFile, setSoundFile] = useState<File | null>(null);
  const [soundTimecode, setSoundTimecode] = useState<string>(item.sound?.timecode || "");
  const [soundDescription, setSoundDescription] = useState<string>(item.sound?.description || "");
  const [soundIsStop, setSoundIsStop] = useState<boolean>(item.sound?.isStop || false);
  const [selectedSound, setSelectedSound] = useState<string>("");
  const [useExistingSound, setUseExistingSound] = useState<boolean>(false);
  const [imageUrl, setImageUrl] = useState<string>(item.image?.url || "");
  const [imageCaption, setImageCaption] = useState<string>(item.image?.caption || "");
  const [stagingItem, setStagingItem] = useState<string>(item.staging?.item || "");
  const [stagingPosition, setStagingPosition] = useState<string>(item.staging?.position || "");
  const [stagingDescription, setStagingDescription] = useState<string>(item.staging?.description || "");
  const [movementCharacter, setMovementCharacter] = useState<string>(item.movement?.characterId || "");
  const [movementFrom, setMovementFrom] = useState<string>(item.movement?.from || "");
  const [movementTo, setMovementTo] = useState<string>(item.movement?.to || "");
  const [movementDescription, setMovementDescription] = useState<string>(item.movement?.description || "");
  const [imageType, setImageType] = useState<"url" | "base64">(item.image?.type || "url");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(item.image?.url || "");
  const [imageWidth, setImageWidth] = useState<number>(item.image?.width || 800);
  const [imageHeight, setImageHeight] = useState<number>(item.image?.height || 600);

  /**
   * Update state when item changes
   */
  useEffect(() => {
    setItemType(item.type);
    setCharacter(item.character || "");
    setText(item.text || "");
    setLightPosition(item.lighting?.position || "");
    setLightColor(item.lighting?.color || "#ffffff");
    setLightIsOff(item.lighting?.isOff || false);
    setSelectedLighting("");
    setUseExistingLighting(false);
    setSoundUrl(item.sound?.url || "");
    setSoundType(item.sound?.type || "url");
    setSoundName(item.sound?.name || "");
    setSoundTimecode(item.sound?.timecode || "");
    setSoundDescription(item.sound?.description || "");
    setSoundIsStop(item.sound?.isStop || false);
    setSelectedSound("");
    setUseExistingSound(false);
    setImageUrl(item.image?.url || "");
    setImageCaption(item.image?.caption || "");
    setStagingItem(item.staging?.item || "");
    setStagingPosition(item.staging?.position || "");
    setStagingDescription(item.staging?.description || "");
    setMovementCharacter(item.movement?.characterId || "");
    setMovementFrom(item.movement?.from || "");
    setMovementTo(item.movement?.to || "");
    setMovementDescription(item.movement?.description || "");
    setImageType(item.image?.type || "url");
    setImagePreview(item.image?.url || "");
    setImageWidth(item.image?.width || 800);
    setImageHeight(item.image?.height || 600);

    // Check if this sound exists in existingSounds
    if (item.sound?.url) {
      const existingSound = existingSounds.find(s => s.url === item.sound?.url);
      if (existingSound) {
        setSelectedSound(existingSound.id);
        setUseExistingSound(true);
      }
    }
  }, [item, existingSounds]);

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
   * Handle form submission and update existing script item
   */
  const handleSubmit = useCallback(async () => {
    const updatedItem: typeof ScriptItemType = {
      ...item,
      type: itemType,
    };

    // Reset all properties first
    delete updatedItem.character;
    delete updatedItem.text;
    delete updatedItem.lighting;
    delete updatedItem.sound;
    delete updatedItem.image;
    delete updatedItem.staging;
    delete updatedItem.movement;

    // Set properties based on type
    switch (itemType) {
      case "dialogue":
        updatedItem.character = character;
        updatedItem.text = text;
        break;
      case "narration":
        updatedItem.character = character; // Allow narration to have a character
        updatedItem.text = text;
        break;
      case "lighting":
        updatedItem.lighting = {
          position: lightPosition,
          color: lightColor,
          isOff: lightIsOff,
        };
        break;
      case "sound":
        if (soundType === "base64" && soundFile) {
          const base64 = await convertSoundToBase64(soundFile);
          updatedItem.sound = {
            url: base64,
            type: "base64",
            name: soundName,
            timecode: soundTimecode,
            description: soundDescription,
            isStop: soundIsStop,
          };
        } else {
          updatedItem.sound = {
            url: soundUrl,
            type: soundType,
            name: soundName,
            timecode: soundTimecode,
            description: soundDescription,
            isStop: soundIsStop,
          };
        }
        break;
      case "image":
        updatedItem.image = {
          url: imageType === "url" ? imageUrl : (await convertImageToBase64(imageFile!)),
          caption: imageCaption,
          width: imageWidth,
          height: imageHeight,
          type: imageType,
        };
        break;
      case "staging":
        updatedItem.staging = {
          item: stagingItem,
          position: stagingPosition,
          description: stagingDescription,
        };
        break;
      case "movement":
        updatedItem.movement = {
          characterId: movementCharacter,
          from: movementFrom,
          to: movementTo,
          description: movementDescription,
        };
        break;
    }

    onUpdate(updatedItem);
    onOpenChange(false);
  }, [itemType, character, text, lightPosition, lightColor, lightIsOff, soundUrl, soundType, soundName, soundTimecode, soundDescription, soundIsStop, imageUrl, imageCaption, imageType, imageFile, imageWidth, imageHeight, stagingItem, stagingPosition, stagingDescription, movementCharacter, movementFrom, movementTo, movementDescription, onUpdate, onOpenChange, convertImageToBase64, convertSoundToBase64]);

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
        return imageUrl;
      case "staging":
        return stagingItem && stagingPosition;
      case "movement":
        return movementCharacter && movementFrom && movementTo;
      default:
        return false;
    }
  }, [itemType, character, text, lightPosition, lightColor, soundUrl, soundTimecode, imageUrl, stagingItem, stagingPosition, movementCharacter, movementFrom, movementTo]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{`Modifier l'élément`}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-item-type">{`Type d'élément`}</Label>
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
                <Label htmlFor="edit-character">{itemType === "dialogue" ? "Personnage" : "Personnage (optionnel)"}</Label>
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
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-text">{itemType === "dialogue" ? "Texte du dialogue" : "Texte de narration"}</Label>
                <Textarea
                  id="edit-text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={itemType === "dialogue" ? "Entrez le texte du dialogue" : "Entrez le texte de narration"}
                  rows={4}
                />
                {itemType === "dialogue" && (
                  <p className="text-xs text-muted-foreground">Utilisez @nom pour mentionner un personnage dans le texte.</p>
                )}
                {itemType === "narration" && (
                  <p className="text-xs text-muted-foreground">Utilisez @nom pour mentionner un personnage dans le texte.</p>
                )}
              </div>
            </>
          )}

          {itemType === "lighting" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="selected-lighting">Éclairage existant</Label>
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
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="use-existing-lighting"
                  checked={useExistingLighting}
                  onChange={(e) => setUseExistingLighting(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="use-existing-lighting">Utiliser l'éclairage existant</Label>
              </div>
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
                        <Label htmlFor="edit-sound-url">URL du son</Label>
                        <Input
                          id="edit-sound-url"
                          value={soundUrl}
                          onChange={(e) => setSoundUrl(e.target.value)}
                          placeholder="https://example.com/sound.mp3"
                        />
                      </div>
                    </TabsContent>
                    <TabsContent value="youtube">
                      <div className="space-y-2">
                        <Label htmlFor="edit-sound-youtube">URL YouTube</Label>
                        <Input
                          id="edit-sound-youtube"
                          value={soundUrl}
                          onChange={(e) => setSoundUrl(e.target.value)}
                          placeholder="https://www.youtube.com/watch?v=..."
                        />
                      </div>
                    </TabsContent>
                    <TabsContent value="base64">
                      <div className="space-y-2">
                        <Label htmlFor="edit-sound-base64">Sélectionner un fichier audio</Label>
                        <Input
                          id="edit-sound-base64"
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
                  <Label htmlFor="edit-sound-name">Nom du son</Label>
                  <Input
                    id="edit-sound-name"
                    value={soundName}
                    onChange={(e) => setSoundName(e.target.value)}
                    placeholder="Nom ou titre de la musique"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-sound-timecode">Timecode</Label>
                  <Input
                    id="edit-sound-timecode"
                    value={soundTimecode}
                    onChange={(e) => setSoundTimecode(e.target.value)}
                    placeholder="00:00:00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-sound-description">Description</Label>
                  <Input
                    id="edit-sound-description"
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
                      <Label htmlFor="edit-image-url">URL de l'image</Label>
                      <Input
                        id="edit-image-url"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                  </TabsContent>
                  <TabsContent value="base64">
                    <div className="space-y-2">
                      <Label htmlFor="edit-image-file">Sélectionner une image</Label>
                      <Input
                        id="edit-image-file"
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
                    <Label htmlFor="edit-image-width">Largeur (px)</Label>
                    <Input
                      id="edit-image-width"
                      type="number"
                      value={imageWidth}
                      onChange={(e) => setImageWidth(Number(e.target.value))}
                      min={100}
                      max={2000}
                      step={100}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-image-height">Hauteur (px)</Label>
                    <Input
                      id="edit-image-height"
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
                  <Label htmlFor="edit-image-caption">Légende</Label>
                  <Input
                    id="edit-image-caption"
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
                <Label htmlFor="edit-staging-item">Élément</Label>
                <Input
                  id="edit-staging-item"
                  value={stagingItem}
                  onChange={(e) => setStagingItem(e.target.value)}
                  placeholder="ex: Table, chaise, etc."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-staging-position">Position</Label>
                <Input
                  id="edit-staging-position"
                  value={stagingPosition}
                  onChange={(e) => setStagingPosition(e.target.value)}
                  placeholder="ex: Centre scène, Côté jardin, etc."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-staging-description">Description</Label>
                <Input
                  id="edit-staging-description"
                  value={stagingDescription}
                  onChange={(e) => setStagingDescription(e.target.value)}
                  placeholder="ex: La table est recouverte d'un tissu rouge"
                />
              </div>
            </>
          )}

          {itemType === "movement" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="edit-movement-character">Personnage</Label>
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
                <Label htmlFor="edit-movement-from">De</Label>
                <Input id="edit-movement-from" value={movementFrom} onChange={(e) => setMovementFrom(e.target.value)} placeholder="ex: Côté jardin" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-movement-to">À</Label>
                <Input id="edit-movement-to" value={movementTo} onChange={(e) => setMovementTo(e.target.value)} placeholder="ex: Centre scène" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-movement-description">Description</Label>
                <Input
                  id="edit-movement-description"
                  value={movementDescription}
                  onChange={(e) => setMovementDescription(e.target.value)}
                  placeholder="ex: John marche lentement vers le centre de la scène"
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
            Mettre à jour
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

export default EditItemDialog;
