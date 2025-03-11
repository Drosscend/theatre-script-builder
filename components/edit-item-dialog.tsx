"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { ScriptItemType, Character } from "./script-editor"

interface EditItemDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    item: ScriptItemType
    characters: Character[]
    onUpdate: (item: ScriptItemType) => void
}

export default function EditItemDialog({ open, onOpenChange, item, characters, onUpdate }: EditItemDialogProps) {
    const [itemType, setItemType] = useState<
        "dialogue" | "narration" | "lighting" | "sound" | "image" | "staging" | "movement"
    >(item.type)
    const [character, setCharacter] = useState<string>(item.character || "")
    const [text, setText] = useState<string>(item.text || "")
    const [lightPosition, setLightPosition] = useState<string>(item.lighting?.position || "")
    const [lightColor, setLightColor] = useState<string>(item.lighting?.color || "#ffffff")
    const [soundUrl, setSoundUrl] = useState<string>(item.sound?.url || "")
    const [soundTimecode, setSoundTimecode] = useState<string>(item.sound?.timecode || "")
    const [soundDescription, setSoundDescription] = useState<string>(item.sound?.description || "")
    const [imageUrl, setImageUrl] = useState<string>(item.image?.url || "")
    const [imageCaption, setImageCaption] = useState<string>(item.image?.caption || "")
    const [stagingItem, setStagingItem] = useState<string>(item.staging?.item || "")
    const [stagingPosition, setStagingPosition] = useState<string>(item.staging?.position || "")
    const [stagingDescription, setStagingDescription] = useState<string>(item.staging?.description || "")
    const [movementCharacter, setMovementCharacter] = useState<string>(item.movement?.character || "")
    const [movementFrom, setMovementFrom] = useState<string>(item.movement?.from || "")
    const [movementTo, setMovementTo] = useState<string>(item.movement?.to || "")
    const [movementDescription, setMovementDescription] = useState<string>(item.movement?.description || "")

    /**
     * Update state when item changes
     */
    useEffect(() => {
        setItemType(item.type)
        setCharacter(item.character || "")
        setText(item.text || "")
        setLightPosition(item.lighting?.position || "")
        setLightColor(item.lighting?.color || "#ffffff")
        setSoundUrl(item.sound?.url || "")
        setSoundTimecode(item.sound?.timecode || "")
        setSoundDescription(item.sound?.description || "")
        setImageUrl(item.image?.url || "")
        setImageCaption(item.image?.caption || "")
        setStagingItem(item.staging?.item || "")
        setStagingPosition(item.staging?.position || "")
        setStagingDescription(item.staging?.description || "")
        setMovementCharacter(item.movement?.character || "")
        setMovementFrom(item.movement?.from || "")
        setMovementTo(item.movement?.to || "")
        setMovementDescription(item.movement?.description || "")
    }, [item])

    /**
     * Handle form submission and update existing script item
     */
    const handleSubmit = () => {
        const updatedItem: ScriptItemType = {
            ...item,
            type: itemType,
        }

        // Reset all properties first
        delete updatedItem.character
        delete updatedItem.text
        delete updatedItem.lighting
        delete updatedItem.sound
        delete updatedItem.image
        delete updatedItem.staging
        delete updatedItem.movement

        // Set properties based on type
        switch (itemType) {
            case "dialogue":
                updatedItem.character = character
                updatedItem.text = text
                break
            case "narration":
                updatedItem.character = character // Allow narration to have a character
                updatedItem.text = text
                break
            case "lighting":
                updatedItem.lighting = {
                    position: lightPosition,
                    color: lightColor,
                }
                break
            case "sound":
                updatedItem.sound = {
                    url: soundUrl,
                    timecode: soundTimecode,
                    description: soundDescription,
                }
                break
            case "image":
                updatedItem.image = {
                    url: imageUrl,
                    caption: imageCaption,
                }
                break
            case "staging":
                updatedItem.staging = {
                    item: stagingItem,
                    position: stagingPosition,
                    description: stagingDescription,
                }
                break
            case "movement":
                updatedItem.movement = {
                    character: movementCharacter,
                    from: movementFrom,
                    to: movementTo,
                    description: movementDescription,
                }
                break
        }

        onUpdate(updatedItem)
        onOpenChange(false)
    }

    /**
     * Check if the form is valid based on current item type
     */
    const isFormValid = () => {
        switch (itemType) {
            case "dialogue":
                return character && text
            case "narration":
                return text // Character is optional for narration
            case "lighting":
                return lightPosition && lightColor
            case "sound":
                return soundUrl && soundTimecode
            case "image":
                return imageUrl
            case "staging":
                return stagingItem && stagingPosition
            case "movement":
                return movementCharacter && movementFrom && movementTo
            default:
                return false
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{`Modifier l'élément`}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="edit-item-type">{`Type d'élément`}</Label>
                        <Select value={itemType} onValueChange={(value) => setItemType(value as "dialogue" | "narration" | "lighting" | "sound" | "image" | "staging" | "movement")}>
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
                                <Label htmlFor="edit-character">
                                    {itemType === "dialogue" ? "Personnage" : "Personnage (optionnel)"}
                                </Label>
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
                                <Label htmlFor="edit-text">
                                    {itemType === "dialogue" ? "Texte du dialogue" : "Texte de narration"}
                                </Label>
                                <Textarea
                                    id="edit-text"
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    placeholder={itemType === "dialogue" ? "Entrez le texte du dialogue" : "Entrez le texte de narration"}
                                    rows={4}
                                />
                                {itemType === "dialogue" && (
                                    <p className="text-xs text-muted-foreground">
                                        Utilisez @nom pour mentionner un personnage dans le texte.
                                    </p>
                                )}
                                {itemType === "narration" && (
                                    <p className="text-xs text-muted-foreground">
                                        Utilisez @nom pour mentionner un personnage dans le texte.
                                    </p>
                                )}
                            </div>
                        </>
                    )}

                    {itemType === "lighting" && (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="edit-light-position">{`Position de l'éclairage`}</Label>
                                <Input
                                    id="edit-light-position"
                                    value={lightPosition}
                                    onChange={(e) => setLightPosition(e.target.value)}
                                    placeholder="ex: Centre scène, Côté jardin, etc."
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-light-color">Couleur</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="edit-light-color"
                                        type="color"
                                        value={lightColor}
                                        onChange={(e) => setLightColor(e.target.value)}
                                        className="w-12 h-10 p-1"
                                    />
                                    <Input
                                        value={lightColor}
                                        onChange={(e) => setLightColor(e.target.value)}
                                        placeholder="#FFFFFF"
                                        className="flex-1"
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    {itemType === "sound" && (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="edit-sound-url">URL du son</Label>
                                <Input
                                    id="edit-sound-url"
                                    value={soundUrl}
                                    onChange={(e) => setSoundUrl(e.target.value)}
                                    placeholder="https://example.com/sound.mp3"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-sound-timecode">Timecode</Label>
                                <Input
                                    id="edit-sound-timecode"
                                    value={soundTimecode}
                                    onChange={(e) => setSoundTimecode(e.target.value)}
                                    placeholder="ex: 00:15 ou 1m30s"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-sound-description">Description</Label>
                                <Input
                                    id="edit-sound-description"
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
                                <Label htmlFor="edit-image-url">{`URL de l'image`}</Label>
                                <Input
                                    id="edit-image-url"
                                    value={imageUrl}
                                    onChange={(e) => setImageUrl(e.target.value)}
                                    placeholder="https://example.com/image.jpg"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-image-caption">Légende</Label>
                                <Input
                                    id="edit-image-caption"
                                    value={imageCaption}
                                    onChange={(e) => setImageCaption(e.target.value)}
                                    placeholder="ex: Acteur regardant la caméra"
                                />
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
                                <Input
                                    id="edit-movement-from"
                                    value={movementFrom}
                                    onChange={(e) => setMovementFrom(e.target.value)}
                                    placeholder="ex: Côté jardin"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-movement-to">À</Label>
                                <Input
                                    id="edit-movement-to"
                                    value={movementTo}
                                    onChange={(e) => setMovementTo(e.target.value)}
                                    placeholder="ex: Centre scène"
                                />
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
    )
}