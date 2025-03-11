"use client";

import { createCharacter, deleteCharacter, updateCharacter } from "@/app/actions/character";
import { PlusIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Character } from "./script-editor";

interface CharactersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  characters: (typeof Character)[];
  setCharacters: (characters: (typeof Character)[]) => void;
  scriptId: string;
}

export default function CharactersDialog({ open, onOpenChange, characters, setCharacters, scriptId }: CharactersDialogProps) {
  const [newRealName, setNewRealName] = useState("");
  const [newStageName, setNewStageName] = useState("");
  const [newRole, setNewRole] = useState("");
  const [newColor, setNewColor] = useState("#e2e8f0");
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Add a new character to the list
   */
  const handleAddCharacter = async () => {
    if (newRealName && newStageName) {
      setIsLoading(true);
      try {
        const result = await createCharacter(scriptId, {
          realName: newRealName,
          stageName: newStageName,
          role: newRole,
          color: newColor,
        });

        if (result.success && result.data) {
          setCharacters([...characters, result.data]);
          toast("Personnage ajouté", {
            description: "Le personnage a été ajouté avec succès",
          });

          // Reset form
          setNewRealName("");
          setNewStageName("");
          setNewRole("");
          setNewColor("#e2e8f0");
        } else {
          toast.error("Erreur", {
            description: "Une erreur est survenue lors de l'ajout du personnage",
          });
        }
      } catch (error) {
        toast.error("Erreur", {
          description: "Une erreur est survenue lors de l'ajout du personnage",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  /**
   * Delete a character from the list
   */
  const handleDeleteCharacter = async (id: string) => {
    setIsLoading(true);
    try {
      const result = await deleteCharacter(id);

      if (result.success) {
        setCharacters(characters.filter((char) => char.id !== id));
        toast("Personnage supprimé", {
          description: "Le personnage a été supprimé avec succès",
        });
      } else {
        toast.error("Erreur", {
          description: "Une erreur est survenue lors de la suppression du personnage",
        });
      }
    } catch (error) {
      toast.error("Erreur", {
        description: "Une erreur est survenue lors de la suppression du personnage",
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Update an existing character property
   */
  const handleUpdateCharacter = async (id: string, field: keyof typeof Character, value: string) => {
    // Mettre à jour localement pour une meilleure réactivité
    const updatedCharacters = characters.map((char) => (char.id === id ? { ...char, [field]: value } : char));
    setCharacters(updatedCharacters);

    // Trouver le personnage mis à jour
    const updatedChar = updatedCharacters.find((char) => char.id === id);
    if (!updatedChar) return;

    try {
      // Mettre à jour dans la base de données
      await updateCharacter(id, {
        realName: updatedChar.realName,
        stageName: updatedChar.stageName,
        role: updatedChar.role,
        color: updatedChar.color,
      });
    } catch (error) {
      toast.error("Erreur", {
        description: "Une erreur est survenue lors de la mise à jour du personnage",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px]">
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
                <ScrollArea className="h-[calc(80vh-250px)]">
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
                      <Input value={char.role} onChange={(e) => handleUpdateCharacter(char.id, "role", e.target.value)} placeholder="Rôle" />
                      <Input
                        type="color"
                        value={char.color}
                        onChange={(e) => handleUpdateCharacter(char.id, "color", e.target.value)}
                        className="h-10 p-1"
                      />
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteCharacter(char.id)} disabled={isLoading}>
                        <Trash2Icon />
                      </Button>
                    </div>
                  ))}
                </ScrollArea>
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
                <Input id="real-name" value={newRealName} onChange={(e) => setNewRealName(e.target.value)} placeholder="Nom réel" />
              </div>
              <div>
                <Label htmlFor="stage-name" className="sr-only">
                  Nom sur scène
                </Label>
                <Input id="stage-name" value={newStageName} onChange={(e) => setNewStageName(e.target.value)} placeholder="Nom sur scène" />
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
                <Input id="color" type="color" value={newColor} onChange={(e) => setNewColor(e.target.value)} className="h-10 p-1" />
              </div>
            </div>
            <Button onClick={handleAddCharacter} disabled={!newRealName || !newStageName || isLoading} className="w-full">
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
  );
}
