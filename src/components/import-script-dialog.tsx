"use client";

import { Loader2Icon, UploadIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { createCharacter, deleteAllCharacters } from "@/app/actions/character";
import { createBulkScriptItems, deleteAllScriptItems } from "@/app/actions/script-item";

interface ImportScriptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scriptId: string;
  onImportComplete: () => void;
}

export function ImportScriptDialog({ open, onOpenChange, scriptId, onImportComplete }: ImportScriptDialogProps) {
  const [isPending, setIsPending] = useState(false);

  const importScript = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const idToast = toast.loading("Importation en cours...");
    setIsPending(true);
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);
        
        // Créer un mappage entre les anciens et nouveaux IDs de personnages
        const characterIdMap = new Map<string, string>();

        if (parsed.characters && Array.isArray(parsed.characters)) {
          toast.loading("Suppression des personnages existants...", { id: idToast });
          await deleteAllCharacters(scriptId);
          toast.success("Suppression des personnages existants terminée", { id: idToast });

          const createPromises = parsed.characters.map((char: any) => {
            const { id, ...charData } = char;
            return { oldId: id, promise: createCharacter(scriptId, charData) };
          });
          
          toast.loading("Création des personnages...", { id: idToast });
          const results = await Promise.all(createPromises.map((item: { promise: Promise<any>; oldId: string }) => item.promise));
          
          // Construire le mappage id ancien -> id nouveau
          results.forEach((result, index) => {
            if (result.success && result.data) {
              const oldId = createPromises[index].oldId;
              const newData = result.data as { id: string; realName: string; stageName: string; role: string; color: string };
              characterIdMap.set(oldId, newData.id);
            }
          });
          
          toast.success("Création des personnages terminée", { id: idToast });
        }

        toast.loading("Suppression des éléments existants...", { id: idToast });
        await deleteAllScriptItems(scriptId);
        toast.success("Suppression des éléments existants terminée", { id: idToast });

        if (parsed.script && Array.isArray(parsed.script)) {
          toast.loading("Création des éléments...", { id: idToast });
          
          // Préparer tous les éléments avec les IDs mis à jour
          const scriptItems = parsed.script.map((item: any) => {
            const updatedCharacterId = item.character && characterIdMap.has(item.character) 
              ? characterIdMap.get(item.character) 
              : item.character;
            
            let updatedMovement = item.movement;
            if (item.type === "movement" && item.movement?.characterId && characterIdMap.has(item.movement.characterId)) {
              updatedMovement = {
                ...item.movement,
                characterId: characterIdMap.get(item.movement.characterId) || item.movement.characterId
              };
            }

            return {
              type: item.type,
              text: item.text,
              characterId: updatedCharacterId,
              lighting: item.lighting,
              sound: item.sound,
              image: item.image,
              staging: item.staging,
              movement: updatedMovement 
                ? {
                    characterId: updatedMovement.characterId || "",
                    from: updatedMovement.from || "",
                    to: updatedMovement.to || "",
                    description: updatedMovement.description,
                  }
                : undefined,
            };
          });

          // Créer tous les éléments en une seule transaction
          const result = await createBulkScriptItems(scriptId, scriptItems);
          
          if (!result.success) {
            throw new Error(typeof result.error === 'string' ? result.error : 'Erreur de validation des données');
          }
        }

        toast.success("Import réussi", {
          description: "Le script a été importé avec succès",
          id: idToast,
        });
        onImportComplete();
        onOpenChange(false);
      } catch (error) {
        toast.error("Erreur", {
          description: "Le fichier importé n'est pas valide.",
          id: idToast,
        });
      } finally {
        setIsPending(false);
      }
    };
    reader.readAsText(file);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Importer un script</AlertDialogTitle>
          <AlertDialogDescription>
            Sélectionnez un fichier JSON pour importer un script. Cette action remplacera tous les éléments existants.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex flex-col items-center justify-center py-4">
          <div className="relative">
            <Button variant="outline" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2Icon className="animate-spin" />
                  Importation en cours...
                </>
              ) : (
                <>
                  <UploadIcon />
                  Sélectionner un fichier
                </>
              )}
              <input 
                type="file" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                accept=".json" 
                onChange={importScript} 
                disabled={isPending}
              />
            </Button>
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Annuler</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
} 