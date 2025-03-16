import { notFound } from "next/navigation";
import { ScriptPreview } from "@/components/script-preview";
import { prisma } from "@/lib/prisma";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

async function getScript(id: string) {
  const script = await prisma.script.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          dialogue: true,
          narration: true,
          lighting: true,
          sound: true,
          image: true,
          staging: true,
          movement: true,
        },
        orderBy: {
          position: "asc",
        },
      },
      characters: true,
    },
  });

  if (!script) {
    notFound();
  }

  return script
}

export default async function ScriptPreviewPage({ params }: PageProps) {
  const script = await getScript((await params).id);

  return (
    <div className="container mx-auto space-y-6">
      <ScriptPreview script={script} scriptId={script.id} scriptName={script.name} />
    </div>
  );
} 