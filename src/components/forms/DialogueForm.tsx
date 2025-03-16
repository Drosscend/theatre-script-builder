"use client";

import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { type UseFormReturn } from "react-hook-form";
import { type ScriptItemFormValues } from "@/lib/schema";
import { Character } from "@prisma/client";

interface DialogueFormProps {
  form: UseFormReturn<ScriptItemFormValues>;
  characters: Character[];
  type: "dialogue" | "narration";
}

export function DialogueForm({ form, characters, type }: DialogueFormProps) {
  return (
    <>
      <FormField
        control={form.control}
        name="character"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Personnage</FormLabel>
            <Select
              value={field.value}
              onValueChange={field.onChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sélectionner un personnage" />
              </SelectTrigger>
              <SelectContent>
                {characters.length > 0 ? (
                  characters.map((character) => (
                    <SelectItem key={character.id} value={character.id}>
                      {character.stageName}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="" disabled>
                    Aucun personnage disponible
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="text"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{type === "dialogue" ? "Dialogue" : "Narration"}</FormLabel>
            <FormControl>
              <Textarea
                placeholder={type === "dialogue" ? "Entrez le dialogue..." : "Entrez la narration..."}
                {...field}
                rows={4}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
} 