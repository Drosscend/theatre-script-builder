"use client";

import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { type UseFormReturn } from "react-hook-form";
import { type ScriptItemFormValues } from "@/lib/schema";

interface StagingFormProps {
  form: UseFormReturn<ScriptItemFormValues>;
}

export function StagingForm({ form }: StagingFormProps) {
  return (
    <>
      <FormField
        control={form.control}
        name="stagingItem"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Élément</FormLabel>
            <FormControl>
              <Input placeholder="ex: Table, Chaise, Décor" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="stagingPosition"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Position</FormLabel>
            <FormControl>
              <Input placeholder="ex: Centre scène, Avant-scène gauche" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="stagingDescription"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Détails sur le positionnement..."
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