"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {Trash2Icon, PlusIcon} from "lucide-react"
import type { Character } from "./script-editor"

interface CharactersDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    characters: Character[]
    setCharacters: (characters: Character[]) => void
}

export default function CharactersDialog({ open, onOpenChange, characters, setCharacters }: CharactersDialogProps) {
    const [newRealName, setNewRealName] = useState("")
    const [newStageName, setNewStageName] = useState("")
    const [newRole, setNewRole] = useState("")
    const [newColor, setNewColor] = useState("#e2e8f0")

    /**
     * Add a new character to the list
     */
    const handleAddCharacter = () => {
        if (newRealName && newStageName) {
            const newCharacter: Character = {
                id: Date.now().toString(),
                realName: newRealName,
                stageName: newStageName,
                role: newRole,
                color: newColor,
            }

            setCharacters([...characters, newCharacter])

            // Reset form
            setNewRealName("")
            setNewStageName("")
            setNewRole("")
            setNewColor("#e2e8f0")
        }
    }

    /**
     * Delete a character from the list
     */
    const handleDeleteCharacter = (id: string) => {
        setCharacters(characters.filter((char) => char.id !== id))
    }

    /**
     * Update an existing character property
     */
    const handleUpdateCharacter = (id: string, field: keyof Character, value: string) => {
        setCharacters(characters.map((char) => (char.id === id ? { ...char, [field]: value } : char)))
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Gestion des personnages</DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium">Personnages existants</h3>

                        {characters.length === 0 ? (
                            <p className="text-sm text-muted-foreground">{`Aucun personnage n'a été ajouté.`}</p>
                        ) : (
                            <div className="space-y-3">
                                {characters.map((char) => (
                                    <div key={char.id} className="grid grid-cols-[1fr_1fr_1fr_80px_40px] gap-2 items-center">
                                        <Input
                                            value={char.realName}
                                            onChange={(e) => handleUpdateCharacter(char.id, "realName", e.target.value)}
                                            placeholder="Nom réel"
                                        />
                                        <Input
                                            value={char.stageName}
                                            onChange={(e) => handleUpdateCharacter(char.id, "stageName", e.target.value)}
                                            placeholder="Nom sur scène"
                                        />
                                        <Input
                                            value={char.role}
                                            onChange={(e) => handleUpdateCharacter(char.id, "role", e.target.value)}
                                            placeholder="Rôle"
                                        />
                                        <Input
                                            type="color"
                                            value={char.color}
                                            onChange={(e) => handleUpdateCharacter(char.id, "color", e.target.value)}
                                            className="h-10 p-1"
                                        />
                                        <Button variant="ghost" size="icon" onClick={() => handleDeleteCharacter(char.id)}>
                                            <Trash2Icon />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-sm font-medium">Ajouter un personnage</h3>
                        <div className="grid grid-cols-[1fr_1fr_1fr_80px] gap-2">
                            <div>
                                <Label htmlFor="real-name" className="sr-only">
                                    Nom réel
                                </Label>
                                <Input
                                    id="real-name"
                                    value={newRealName}
                                    onChange={(e) => setNewRealName(e.target.value)}
                                    placeholder="Nom réel"
                                />
                            </div>
                            <div>
                                <Label htmlFor="stage-name" className="sr-only">
                                    Nom sur scène
                                </Label>
                                <Input
                                    id="stage-name"
                                    value={newStageName}
                                    onChange={(e) => setNewStageName(e.target.value)}
                                    placeholder="Nom sur scène"
                                />
                            </div>
                            <div>
                                <Label htmlFor="role" className="sr-only">
                                    Rôle
                                </Label>
                                <Input id="role" value={newRole} onChange={(e) => setNewRole(e.target.value)} placeholder="Rôle" />
                            </div>
                            <div>
                                <Label htmlFor="color" className="sr-only">
                                    Couleur
                                </Label>
                                <Input
                                    id="color"
                                    type="color"
                                    value={newColor}
                                    onChange={(e) => setNewColor(e.target.value)}
                                    className="h-10 p-1"
                                />
                            </div>
                        </div>
                        <Button onClick={handleAddCharacter} disabled={!newRealName || !newStageName} className="w-full">
                            <PlusIcon />
                            Ajouter
                        </Button>
                    </div>
                </div>

                <DialogFooter>
                    <Button onClick={() => onOpenChange(false)}>Fermer</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}