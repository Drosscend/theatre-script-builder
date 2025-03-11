import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Character } from "./script-editor";
import { createCharacter, updateCharacter, deleteCharacter } from "@/app/actions/character";
import { toast } from "sonner"
import { Trash2 } from "lucide-react";

interface CharacterManagerProps {
  characters: typeof Character[];
  scriptId: string;
  onCharactersChange: (characters: typeof Character[]) => void;
}

export function CharacterManager({ characters, scriptId, onCharactersChange }: CharacterManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAddingCharacter, setIsAddingCharacter] = useState(false);
  const [newCharacter, setNewCharacter] = useState<Omit<typeof Character, "id">>({
    realName: "",
    stageName: "",
    role: "",
    color: "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0"),
  });

  const handleAddCharacter = async () => {
    if (!newCharacter.realName || !newCharacter.stageName) {
      toast.error("Le nom réel et le nom de scène sont requis");
      return;
    }

    setIsAddingCharacter(true);
    try {
      const result = await createCharacter(scriptId, newCharacter);
      
      if (result.success && result.data) {
        const characterData: typeof Character = {
          id: result.data.id,
          realName: result.data.realName,
          stageName: result.data.stageName,
          role: result.data.role,
          color: result.data.color
        };
        
        onCharactersChange([...characters, characterData]);
        setNewCharacter({
          realName: "",
          stageName: "",
          role: "",
          color: "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0"),
        });
        toast("Personnage ajouté", {
          description: "Le personnage a été ajouté avec succès",
        });
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
      setIsAddingCharacter(false);
    }
  };

  const handleUpdateCharacter = async (character: typeof Character) => {
    try {
      const { id, ...characterData } = character;
      const result = await updateCharacter(id, characterData);
      
      if (result.success && result.data) {
        const updatedCharacter: typeof Character = {
          id: result.data.id,
          realName: result.data.realName,
          stageName: result.data.stageName,
          role: result.data.role,
          color: result.data.color
        };
        
        onCharactersChange(
          characters.map((c) => (c.id === character.id ? updatedCharacter : c))
        );
        toast("Personnage mis à jour", {
          description: "Le personnage a été mis à jour avec succès",
        });
      } else {
        toast.error("Erreur", {
          description: "Une erreur est survenue lors de la mise à jour du personnage",
        });
      }
    } catch (error) {
      toast.error("Erreur", {
        description: "Une erreur est survenue lors de la mise à jour du personnage",
      });
    }
  };

  const handleDeleteCharacter = async (id: string) => {
    try {
      const result = await deleteCharacter(id);
      
      if (result.success) {
        onCharactersChange(characters.filter((c) => c.id !== id));
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
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Gérer les personnages</Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gérer les personnages</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Personnages existants</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {characters.map((character) => (
                <div
                  key={character.id}
                  className="p-4 border rounded-md flex flex-col space-y-2"
                >
                  <div className="flex justify-between items-center">
                    <div
                      className="w-6 h-6 rounded-full"
                      style={{ backgroundColor: character.color }}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteCharacter(character.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor={`realName-${character.id}`}>Nom réel</Label>
                      <Input
                        id={`realName-${character.id}`}
                        value={character.realName}
                        onChange={(e) =>
                          onCharactersChange(
                            characters.map((c) =>
                              c.id === character.id
                                ? { ...c, realName: e.target.value }
                                : c
                            )
                          )
                        }
                        onBlur={() => handleUpdateCharacter(character)}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`stageName-${character.id}`}>Nom de scène</Label>
                      <Input
                        id={`stageName-${character.id}`}
                        value={character.stageName}
                        onChange={(e) =>
                          onCharactersChange(
                            characters.map((c) =>
                              c.id === character.id
                                ? { ...c, stageName: e.target.value }
                                : c
                            )
                          )
                        }
                        onBlur={() => handleUpdateCharacter(character)}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`role-${character.id}`}>Rôle</Label>
                      <Input
                        id={`role-${character.id}`}
                        value={character.role}
                        onChange={(e) =>
                          onCharactersChange(
                            characters.map((c) =>
                              c.id === character.id
                                ? { ...c, role: e.target.value }
                                : c
                            )
                          )
                        }
                        onBlur={() => handleUpdateCharacter(character)}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`color-${character.id}`}>Couleur</Label>
                      <div className="flex space-x-2">
                        <Input
                          id={`color-${character.id}`}
                          type="color"
                          value={character.color}
                          onChange={(e) =>
                            onCharactersChange(
                              characters.map((c) =>
                                c.id === character.id
                                  ? { ...c, color: e.target.value }
                                  : c
                              )
                            )
                          }
                          onBlur={() => handleUpdateCharacter(character)}
                          className="w-12 h-10 p-1"
                        />
                        <Input
                          value={character.color}
                          onChange={(e) =>
                            onCharactersChange(
                              characters.map((c) =>
                                c.id === character.id
                                  ? { ...c, color: e.target.value }
                                  : c
                              )
                            )
                          }
                          onBlur={() => handleUpdateCharacter(character)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4 border-t pt-4">
            <h3 className="text-lg font-medium">Ajouter un personnage</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="newRealName">Nom réel</Label>
                <Input
                  id="newRealName"
                  value={newCharacter.realName}
                  onChange={(e) =>
                    setNewCharacter({ ...newCharacter, realName: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="newStageName">Nom de scène</Label>
                <Input
                  id="newStageName"
                  value={newCharacter.stageName}
                  onChange={(e) =>
                    setNewCharacter({ ...newCharacter, stageName: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="newRole">Rôle</Label>
                <Input
                  id="newRole"
                  value={newCharacter.role}
                  onChange={(e) =>
                    setNewCharacter({ ...newCharacter, role: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="newColor">Couleur</Label>
                <div className="flex space-x-2">
                  <Input
                    id="newColor"
                    type="color"
                    value={newCharacter.color}
                    onChange={(e) =>
                      setNewCharacter({ ...newCharacter, color: e.target.value })
                    }
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    value={newCharacter.color}
                    onChange={(e) =>
                      setNewCharacter({ ...newCharacter, color: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>
            <Button 
              onClick={handleAddCharacter} 
              disabled={isAddingCharacter}
              className="mt-2"
            >
              {isAddingCharacter ? "Ajout en cours..." : "Ajouter le personnage"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 