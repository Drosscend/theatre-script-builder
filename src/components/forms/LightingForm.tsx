"use client";

import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { type UseFormReturn } from "react-hook-form";
import { type ExistingLighting, type ScriptItemFormValues } from "@/lib/schema";

interface LightingFormProps {
  form: UseFormReturn<ScriptItemFormValues>;
  existingLightings: ExistingLighting[];
}

export function LightingForm({ form, existingLightings }: LightingFormProps) {
  const useExistingLighting = form.watch("useExistingLighting");

  return (
    <>
      <FormField
        control={form.control}
        name="useExistingLighting"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>
                Utiliser un éclairage existant
              </FormLabel>
            </div>
          </FormItem>
        )}
      />

      {useExistingLighting ? (
        <FormField
          control={form.control}
          name="selectedLighting"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Éclairage existant</FormLabel>
              <Select
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sélectionner un éclairage" />
                </SelectTrigger>
                <SelectContent>
                  {existingLightings.length > 0 ? (
                    existingLightings.map((lighting) => (
                      <SelectItem key={lighting.id} value={lighting.id}>
                        {lighting.position} - {lighting.color}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="" disabled>
                      Aucun éclairage disponible
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      ) : (
        <>
          <FormField
            control={form.control}
            name="lightPosition"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Position</FormLabel>
                <FormControl>
                  <Input placeholder="ex: Centre scène, Avant-scène jardin" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lightColor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Couleur</FormLabel>
                <FormControl>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      className="w-12 p-1 h-10"
                      {...field}
                    />
                    <Input
                      type="text"
                      placeholder="#FFFFFF"
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      )}

      {useExistingLighting && (
        <FormField
          control={form.control}
          name="lightIsOff"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Éteindre la lumière
                </FormLabel>
              </div>
            </FormItem>
          )}
        />
      )}
    </>
  );
} 