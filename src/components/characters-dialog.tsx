"use client";

import { createCharacter, deleteCharacter, updateCharacter } from "@/app/actions/character";
import { PlusIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { useState, useCallback, memo } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { characterSchema, type CharacterFormValues } from "@/lib/schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Character } from "@prisma/client";
import { useAction } from "next-safe-action/hooks";

interface CharactersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  characters: Character[];
  setCharacters: React.Dispatch<React.SetStateAction<Character[]>>;
  scriptId: string;
}

const CharactersDialog = memo(function CharactersDialog({ open, onOpenChange, characters, setCharacters, scriptId }: CharactersDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<CharacterFormValues>({
    resolver: zodResolver(characterSchema),
    defaultValues: {
      realName: "",
      stageName: "",
      role: "",
      color: "#e2e8f0",
    },
    mode: "onChange",
  });

  const { executeAsync: executeCreateCharacter } = useAction(createCharacter, {
    onSuccess: ({ data }) => {
      if (data?.data) {
        const newCharacter = data.data as Character;
        setCharacters((prev: Character[]) => [...prev, newCharacter]);
        toast.success("Personnage ajouté", {
          description: "Le personnage a été ajouté avec succès",
        });
        form.reset();
      }
    },
    onError: ({ error }) => {
      toast.error("Erreur", {
        description: error.serverError || "Une erreur est survenue lors de l'ajout du personnage",
      });
    },
  });

  const { execute: executeDeleteCharacter } = useAction(deleteCharacter, {
    onSuccess: () => {
      toast.success("Personnage supprimé", {
        description: "Le personnage a été supprimé avec succès",
      });
    },
    onError: ({ error }) => {
      toast.error("Erreur", {
        description: error.serverError || "Une erreur est survenue lors de la suppression du personnage",
      });
    },
  });

  const { execute: executeUpdateCharacter } = useAction(updateCharacter, {
    onError: ({ error }) => {
      toast.error("Erreur", {
        description: error.serverError || "Une erreur est survenue lors de la mise à jour du personnage",
      });
    },
  });

  const onSubmit = useCallback(async (data: CharacterFormValues) => {
    setIsLoading(true);
    try {
      await executeCreateCharacter({
        ...data,
        scriptId,
      });
    } finally {
      setIsLoading(false);
    }
  }, [executeCreateCharacter, scriptId]);

  const handleDeleteCharacter = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      await executeDeleteCharacter({ id });
      setCharacters(characters.filter((char) => char.id !== id));
    } finally {
      setIsLoading(false);
    }
  }, [executeDeleteCharacter, setCharacters, characters]);

  const handleUpdateCharacter = useCallback(async (id: string, field: keyof Character, value: string) => {
    const updatedCharacters = characters.map((char) => (char.id === id ? { ...char, [field]: value } : char));
    setCharacters(updatedCharacters);

    const updatedChar = updatedCharacters.find((char) => char.id === id);
    if (!updatedChar) return;

    try {
      await executeUpdateCharacter({
        id,
        realName: updatedChar.realName,
        stageName: updatedChar.stageName,
        role: updatedChar.role,
        color: updatedChar.color,
      });
    } catch (error) {
      // Error will be handled by onError callback
    }
  }, [executeUpdateCharacter, setCharacters, characters]);

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
                <ScrollArea className="h-[300px] pr-4" type="auto">
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
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteCharacter(char.id)} disabled={isLoading}>
                          <Trash2Icon />
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium">Ajouter un personnage</h3>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-[1fr_1fr_1fr_80px] gap-2">
                  <FormField
                    control={form.control}
                    name="realName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="sr-only">Nom réel</FormLabel>
                        <FormControl>
                          <Input placeholder="Nom réel" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="stageName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="sr-only">Nom sur scène</FormLabel>
                        <FormControl>
                          <Input placeholder="Nom sur scène" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="sr-only">Rôle</FormLabel>
                        <FormControl>
                          <Input placeholder="Rôle" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="color"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="sr-only">Couleur</FormLabel>
                        <FormControl>
                          <Input type="color" className="h-10 p-1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={isLoading || !form.formState.isValid} 
                  className="w-full"
                >
                  <PlusIcon />
                  Ajouter
                </Button>
              </form>
            </Form>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Fermer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

export default CharactersDialog;
