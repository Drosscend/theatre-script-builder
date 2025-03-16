import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

async function getScripts() {
  const scripts = await prisma.script.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      updatedAt: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return scripts;
}

export default async function HomePage() {
  const scripts = await getScripts();

  return (
    <div className="container mx-auto p-4 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{`Constructeur de Scripts de Théâtre`}</h1>
        <Link href="/scripts/new">
          <Button>
            <PlusCircle />
            Nouveau Script
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {scripts.length === 0 ? (
          <Card className="col-span-full">
            <CardHeader>
              <CardTitle>Aucun script</CardTitle>
              <CardDescription>{`Vous n'avez pas encore créé de script. Commencez par en créer un nouveau.`}</CardDescription>
            </CardHeader>
            <CardFooter>
              <Link href="/scripts/new">
                <Button>
                  <PlusCircle />
                  Créer un script
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ) : (
          scripts.map((script) => (
            <Link href={`/scripts/${script.id}`} key={script.id} className="block">
              <Card className="h-full transition-all hover:shadow-md">
                <CardHeader>
                  <CardTitle>{script.name}</CardTitle>
                  <CardDescription>{script.description || "Aucune description"}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Dernière modification: {new Date(script.updatedAt).toLocaleDateString()}</p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    Ouvrir
                  </Button>
                </CardFooter>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
