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
import { deleteAllCharacters } from "@/app/actions/character";
import { deleteAllScriptItems, importScriptItems } from "@/app/actions/script-item";
import { ScriptWithRelations } from "@/lib/types";

interface ImportScriptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scriptId: string;
  onImportComplete: (data: ScriptWithRelations) => void;
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

        // Vérifier que le fichier a la bonne structure
        if (!parsed.script || !Array.isArray(parsed.script) || !parsed.characters || !Array.isArray(parsed.characters)) {
          throw new Error("Format de fichier invalide");
        }

        // Supprimer les éléments existants
        toast.loading("Suppression des données existantes...", { id: idToast });
        await Promise.all([
          deleteAllCharacters(scriptId),
          deleteAllScriptItems(scriptId)
        ]);
        toast.success("Suppression des données existantes terminée", { id: idToast });

        // Importer les nouveaux éléments
        toast.loading("Import des nouveaux éléments...", { id: idToast });
        const result = await importScriptItems(scriptId, {
          script: parsed.script,
          characters: parsed.characters
        });

        if (!result.success) {
          throw new Error(typeof result.error === 'string' ? result.error : 'Erreur de validation des données');
        }

        toast.success("Import réussi", {
          description: "Le script a été importé avec succès",
          id: idToast,
        });
        onImportComplete(result.data as ScriptWithRelations);
        onOpenChange(false);
      } catch (error) {
        console.error('Import error:', error);
        toast.error("Erreur", {
          description: error instanceof Error ? error.message : "Le fichier importé n'est pas valide.",
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
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  Importation en cours...
                </>
              ) : (
                <>
                  <UploadIcon className="mr-2 h-4 w-4" />
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