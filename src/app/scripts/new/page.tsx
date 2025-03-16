"use client";

import { createScript } from "@/app/actions/script";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, CardAction } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { scriptSchema, ScriptFormValues } from "@/lib/schema";
import { useAction } from "next-safe-action/hooks";

export default function NewScriptPage() {
  const router = useRouter();
  const { executeAsync, isPending } = useAction(createScript, {
    onError: ({error}) => {
      toast.error("Erreur", {
        description: error.serverError || "Une erreur est survenue lors de la création du script",
      });
    },
    onSuccess: ({data}) => {
      toast.success("Script créé", {
        description: "Votre script a été créé avec succès",
      });
      router.push(`/scripts/${data?.data.id}`);
    }
  });

  const form = useForm<ScriptFormValues>({
    resolver: zodResolver(scriptSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  async function onSubmit(values: ScriptFormValues) {
    await executeAsync(values);
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle>Créer un nouveau script</CardTitle>
          <CardDescription>Commencez par donner un titre et une description à votre script</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Titre</FormLabel>
                    <FormControl>
                      <Input placeholder="Titre du script" {...field} />
                    </FormControl>
                    <FormDescription>Le titre principal de votre script</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Description du script (optionnelle)" className="min-h-[100px]" {...field} />
                    </FormControl>
                    <FormDescription>Une brève description de votre script</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <CardFooter className="flex justify-end space-x-2">
                <CardAction>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => router.back()} 
                    disabled={isPending}
                  >
                    Annuler
                  </Button>
                </CardAction>
                <CardAction>
                  <Button type="submit" disabled={isPending}>
                    {isPending ? "Création..." : "Créer le script"}
                  </Button>
                </CardAction>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
