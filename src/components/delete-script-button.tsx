"use client";

import { deleteScript } from "@/app/actions/script";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { startTransition, useState, useTransition } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useAction } from "next-safe-action/hooks";

interface DeleteScriptButtonProps {
  scriptId: string;
  scriptName: string;
}

export function DeleteScriptButton({ scriptId, scriptName }: DeleteScriptButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { executeAsync, isPending } = useAction(deleteScript, {
    onError: ({error}) => {
      toast.error("Erreur", {
        description: error.serverError || "Une erreur est survenue lors de la suppression du script",
      });
    },
    onSuccess: () => {
      toast.success("Script supprimé", {
        description: "Le script a été supprimé avec succès",
      });
      router.push("/");
    }
  });

  const handleDelete = async () => {
    await executeAsync({ id: scriptId });
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Trash2 />
          Supprimer le script
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer ce script ?</AlertDialogTitle>
          <AlertDialogDescription>
            Vous êtes sur le point de supprimer le script "{scriptName}". Cette action est irréversible.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={isPending}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isPending ? "Suppression..." : "Supprimer"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
