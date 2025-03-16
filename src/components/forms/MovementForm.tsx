"use client";

import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { type UseFormReturn } from "react-hook-form";
import { type ScriptItemFormValues } from "@/lib/schema";
import { Character } from "@prisma/client";

interface MovementFormProps {
  form: UseFormReturn<ScriptItemFormValues>;
  characters: Character[];
}

export function MovementForm({ form, characters }: MovementFormProps) {
  return (
    <>
      <FormField
        control={form.control}
        name="movementCharacter"
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
        name="movementFrom"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Position de départ</FormLabel>
            <FormControl>
              <Input placeholder="ex: Coulisses jardin" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="movementTo"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Position d'arrivée</FormLabel>
            <FormControl>
              <Input placeholder="ex: Centre scène" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="movementDescription"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea
                placeholder="ex: Marche lentement, en regardant autour"
                {...field}
                rows={3}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
} 