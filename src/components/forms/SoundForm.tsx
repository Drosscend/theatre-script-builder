"use client";

import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { type UseFormReturn } from "react-hook-form";
import { type ExistingSound, type ScriptItemFormValues } from "@/lib/schema";
import { toast } from "sonner";

interface SoundFormProps {
  form: UseFormReturn<ScriptItemFormValues>;
  existingSounds: ExistingSound[];
  onSoundFileChange: (file: File) => void;
}

export function SoundForm({ form, existingSounds, onSoundFileChange }: SoundFormProps) {
  const useExistingSound = form.watch("useExistingSound");
  const soundType = form.watch("soundType");

  return (
    <>
      <FormField
        control={form.control}
        name="useExistingSound"
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
                Utiliser un son existant
              </FormLabel>
            </div>
          </FormItem>
        )}
      />

      {useExistingSound ? (
        <FormField
          control={form.control}
          name="selectedSound"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Son existant</FormLabel>
              <Select
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sélectionner un son" />
                </SelectTrigger>
                <SelectContent>
                  {existingSounds.length > 0 ? (
                    existingSounds.map((sound) => (
                      <SelectItem key={sound.id} value={sound.id}>
                        {sound.description || sound.url}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="" disabled>
                      Aucun son disponible
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
            name="soundType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type de son</FormLabel>
                <Tabs
                  value={field.value}
                  onValueChange={field.onChange}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="url">URL</TabsTrigger>
                    <TabsTrigger value="youtube">YouTube</TabsTrigger>
                    <TabsTrigger value="base64">Fichier</TabsTrigger>
                  </TabsList>
                </Tabs>
                <FormMessage />
              </FormItem>
            )}
          />

          {soundType === "base64" ? (
            <FormField
              control={form.control}
              name="soundUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fichier audio</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="audio/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 10 * 1024 * 1024) {
                            form.setError("soundUrl", {
                              type: "manual",
                              message: "Le fichier ne doit pas dépasser 10MB"
                            });
                            return;
                          }
                          onSoundFileChange(file);
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : (
            <FormField
              control={form.control}
              name="soundUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL {soundType === "youtube" ? "YouTube" : "du son"}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={soundType === "youtube" ? "https://www.youtube.com/watch?v=..." : "https://..."}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="soundName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom du son</FormLabel>
                <FormControl>
                  <Input placeholder="ex: Musique d'ambiance" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="soundTimecode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Timecode</FormLabel>
                <FormControl>
                  <Input placeholder="ex: 1:30" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="soundDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Description du son..."
                    {...field}
                    rows={3}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      )}

      {useExistingSound && (
        <FormField
          control={form.control}
          name="soundIsStop"
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
                  Arrêter la musique
                </FormLabel>
              </div>
            </FormItem>
          )}
        />
      )}
    </>
  );
} 