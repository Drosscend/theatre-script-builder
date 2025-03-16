"use client";

import { useState, useCallback, memo } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import React from "react";
import { DialogueForm } from "./forms/DialogueForm";
import { SoundForm } from "./forms/SoundForm";
import { ImageForm } from "./forms/ImageForm";
import { LightingForm } from "./forms/LightingForm";
import { StagingForm } from "./forms/StagingForm";
import { MovementForm } from "./forms/MovementForm";
import {
  type ExistingLighting,
  type ExistingSound,
  type ScriptItem,
  type ScriptItemFormValues,
  scriptItemSchema,
} from "@/lib/schema";
import { Character } from "@prisma/client";
import { ScriptItemWithRelations } from "@/lib/types";

interface EditItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: ScriptItemWithRelations;
  onUpdate: (item: ScriptItem) => void;
  characters: Character[];
  existingLightings?: ExistingLighting[];
  existingSounds?: ExistingSound[];
}

const FileInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>((props, ref) => {
  const { onChange, ...rest } = props;
  const inputRef = React.useRef<HTMLInputElement>(null);

  return (
    <Input
      type="file"
      ref={inputRef}
      onChange={(e) => {
        if (onChange) {
          onChange(e);
        }
        // Reset the input value to allow selecting the same file again
        if (inputRef.current) {
          inputRef.current.value = "";
        }
      }}
      {...rest}
    />
  );
});
FileInput.displayName = "FileInput";

export const EditItemDialog = memo(function EditItemDialog({ 
  open, 
  onOpenChange, 
  item,
  onUpdate,
  characters,
  existingLightings = [],
  existingSounds = []
}: EditItemDialogProps) {
  const [imagePreview, setImagePreview] = useState<string>(
    item.type === "image" && item.image ? item.image.url || "" : ""
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [soundFile, setSoundFile] = useState<File | null>(null);

  const form = useForm<ScriptItemFormValues>({
    resolver: zodResolver(scriptItemSchema),
    defaultValues: {
      type: item.type as ScriptItemFormValues["type"],
      ...(item.type === "dialogue" && item.dialogue ? {
        text: item.dialogue.text || "",
        character: item.dialogue.characterId || "",
      } : item.type === "narration" && item.narration ? {
        text: item.narration.text || "",
        character: item.narration.characterId || "",
      } : item.type === "lighting" && item.lighting ? {
        lightPosition: item.lighting.position || "",
        lightColor: item.lighting.color || "#ffffff",
        lightIsOff: item.lighting.isOff || false,
        selectedLighting: "",
        useExistingLighting: false,
      } : item.type === "sound" && item.sound ? {
        soundUrl: item.sound.url || "",
        soundType: item.sound.type as "url" | "base64" | "youtube",
        soundName: item.sound.name || "",
        soundTimecode: item.sound.timecode || "",
        soundDescription: item.sound.description || "",
        soundIsStop: item.sound.isStop || false,
        selectedSound: "",
        useExistingSound: false,
      } : item.type === "image" && item.image ? {
        imageUrl: item.image.url || "",
        imageType: item.image.type as "url" | "base64",
        imageWidth: item.image.width || 800,
        imageHeight: item.image.height || 600,
        imageCaption: item.image.caption || "",
      } : item.type === "staging" && item.staging ? {
        stagingItem: item.staging.item || "",
        stagingPosition: item.staging.position || "",
        stagingDescription: item.staging.description || "",
      } : item.type === "movement" && item.movement ? {
        movementCharacter: item.movement.characterId || "",
        movementFrom: item.movement.from || "",
        movementTo: item.movement.to || "",
        movementDescription: item.movement.description || "",
      } : {}),
    },
  });

  const itemType = form.watch("type") as ScriptItemFormValues["type"];

  const resetForm = useCallback(() => {
    form.reset();
    setImagePreview("");
    setImageFile(null);
    setSoundFile(null);
  }, [form]);

  const handleSubmit = useCallback(async (values: ScriptItemFormValues) => {
    const updatedItem: ScriptItem = {
      ...item,
      ...values,
    };

    onUpdate(updatedItem);
    onOpenChange(false);
  }, [item, onUpdate, onOpenChange]);

  const onImageFileChange = useCallback((file: File) => {
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
      form.setValue("imageUrl", reader.result as string);
      form.setValue("imageType", "base64");
    };
    reader.readAsDataURL(file);
  }, [form]);

  const onSoundFileChange = useCallback((file: File) => {
    setSoundFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      form.setValue("soundUrl", reader.result as string);
      form.setValue("soundName", file.name);
      form.setValue("soundType", "base64");
    };
    reader.readAsDataURL(file);
  }, [form]);

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        if (!newOpen) resetForm();
        onOpenChange(newOpen);
      }}
    >
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Modifier l'élément</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type d'élément</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={(value: ScriptItemFormValues["type"]) => {
                      field.onChange(value);
                      const defaultValues = {
                        type: value,
                        ...(value === "dialogue" || value === "narration" ? {
                          text: "",
                          character: "",
                        } : value === "lighting" ? {
                          lightPosition: "",
                          lightColor: "#ffffff",
                          lightIsOff: false,
                          selectedLighting: "",
                          useExistingLighting: false,
                        } : value === "sound" ? {
                          soundUrl: "",
                          soundType: "url" as const,
                          soundName: "",
                          soundTimecode: "",
                          soundDescription: "",
                          soundIsStop: false,
                          selectedSound: "",
                          useExistingSound: false,
                        } : value === "image" ? {
                          imageUrl: "",
                          imageType: "url" as const,
                          imageWidth: 800,
                          imageHeight: 600,
                          imageCaption: "",
                        } : value === "staging" ? {
                          stagingItem: "",
                          stagingPosition: "",
                          stagingDescription: "",
                        } : value === "movement" ? {
                          movementCharacter: "",
                          movementFrom: "",
                          movementTo: "",
                          movementDescription: "",
                        } : {}),
                      } as ScriptItemFormValues;
                      form.reset(defaultValues);
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sélectionner un type d'élément" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dialogue">Dialogue</SelectItem>
                      <SelectItem value="narration">Narration</SelectItem>
                      <SelectItem value="lighting">Éclairage</SelectItem>
                      <SelectItem value="sound">Son</SelectItem>
                      <SelectItem value="image">Image</SelectItem>
                      <SelectItem value="staging">Mise en scène</SelectItem>
                      <SelectItem value="movement">Mouvement</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {(itemType === "dialogue" || itemType === "narration") && (
              <DialogueForm
                form={form}
                characters={characters}
                type={itemType}
              />
            )}

            {itemType === "lighting" && (
              <LightingForm
                form={form}
                existingLightings={existingLightings}
              />
            )}

            {itemType === "sound" && (
              <SoundForm
                form={form}
                existingSounds={existingSounds}
                onSoundFileChange={onSoundFileChange}
              />
            )}

            {itemType === "image" && (
              <ImageForm
                form={form}
                imagePreview={imagePreview}
                onImageFileChange={onImageFileChange}
              />
            )}

            {itemType === "staging" && (
              <StagingForm form={form} />
            )}

            {itemType === "movement" && (
              <MovementForm
                form={form}
                characters={characters}
              />
            )}

            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
                Annuler
              </Button>
              <Button type="submit">
                Mettre à jour
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
});

export default EditItemDialog;
