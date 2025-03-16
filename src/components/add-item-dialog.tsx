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

interface AddItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (item: ScriptItem) => void;
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

export const AddItemDialog = memo(function AddItemDialog({ 
  open, 
  onOpenChange, 
  onAdd, 
  characters,
  existingLightings = [],
  existingSounds = []
}: AddItemDialogProps) {
  const [imagePreview, setImagePreview] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [soundFile, setSoundFile] = useState<File | null>(null);

  const form = useForm<ScriptItemFormValues>({
    resolver: zodResolver(scriptItemSchema),
    defaultValues: {
      type: "dialogue",
      text: "",
      character: "",
    },
  });

  const itemType = form.watch("type");

  const resetForm = useCallback(() => {
    form.reset();
    setImagePreview("");
    setImageFile(null);
    setSoundFile(null);
  }, [form]);

  const handleSubmit = useCallback(async (values: ScriptItemFormValues) => {
    const newItem: ScriptItem = {
      id: Date.now().toString(),
      ...values,
    };

    onAdd(newItem);
    resetForm();
    onOpenChange(false);
  }, [onAdd, resetForm, onOpenChange]);

  const onImageFileChange = useCallback((file: File) => {
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const onSoundFileChange = useCallback((file: File) => {
    setSoundFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      form.setValue("soundUrl", reader.result as string);
      form.setValue("soundName", file.name);
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
          <DialogTitle>Ajouter un élément au script</DialogTitle>
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
                Ajouter
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
});
