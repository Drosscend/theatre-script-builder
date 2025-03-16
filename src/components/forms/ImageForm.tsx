"use client";

import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { type UseFormReturn } from "react-hook-form";
import { type ScriptItemFormValues } from "@/lib/schema";
import { toast } from "sonner";

interface ImageFormProps {
  form: UseFormReturn<ScriptItemFormValues>;
  imagePreview: string;
  onImageFileChange: (file: File) => void;
}

export function ImageForm({ form, imagePreview, onImageFileChange }: ImageFormProps) {
  const imageType = form.watch("imageType");

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Erreur", {
        description: "Le fichier doit être une image",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Erreur", {
        description: "L'image ne doit pas dépasser 5MB",
      });
      return;
    }

    onImageFileChange(file);
  };

  return (
    <>
      <FormField
        control={form.control}
        name="imageType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Type d'image</FormLabel>
            <Tabs
              value={field.value}
              onValueChange={field.onChange}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="url">URL</TabsTrigger>
                <TabsTrigger value="base64">Fichier</TabsTrigger>
              </TabsList>
            </Tabs>
            <FormMessage />
          </FormItem>
        )}
      />

      {imageType === "base64" ? (
        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fichier image</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.size > 5 * 1024 * 1024) {
                        form.setError("imageUrl", {
                          type: "manual",
                          message: "Le fichier ne doit pas dépasser 5MB"
                        });
                        return;
                      }
                      onImageFileChange(file);
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
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL de l'image</FormLabel>
              <FormControl>
                <Input placeholder="https://..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {imagePreview && (
        <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
          <img
            src={imagePreview}
            alt="Aperçu"
            className="object-contain w-full h-full"
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="imageWidth"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Largeur</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  max={1920}
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="imageHeight"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hauteur</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  max={1080}
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="imageCaption"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Légende</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Description de l'image..."
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