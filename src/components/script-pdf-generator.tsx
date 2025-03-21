"use client";

import { useState, useCallback, memo } from "react";
import { Button } from "@/components/ui/button";
import { FileTextIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ScriptWithRelations } from "@/lib/types";

// PDF styles definition
const styles = {
  page: {
    flexDirection: "column" as const,
    backgroundColor: "#FFFFFF",
    padding: 40,
  },
  title: {
    fontSize: 20,
    marginBottom: 30,
    textAlign: "center" as const,
    fontWeight: "bold" as const,
  },
  section: {
    marginBottom: 8,
    display: "flex" as const,
    flexDirection: "row" as const,
  },
  lineNumber: {
    width: 24,
    fontSize: 8,
    color: "#666666",
    marginRight: 8,
  },
  content: {
    flex: 1,
  },
  dialogueHeader: {
    fontSize: 10,
    fontWeight: "bold" as const,
    marginBottom: 2,
  },
  dialogueText: {
    fontSize: 9,
    marginLeft: 16,
    marginBottom: 4,
  },
  narrationText: {
    fontSize: 9,
    fontStyle: "italic" as const,
    marginBottom: 4,
  },
  technicalBlock: {
    backgroundColor: "#F8F9FA",
    padding: 8,
    marginBottom: 4,
    borderRadius: 4,
  },
  technicalHeader: {
    fontSize: 9,
    fontWeight: "bold" as const,
    marginBottom: 2,
  },
  technicalContent: {
    fontSize: 8,
    color: "#374151",
  },
  technicalUrl: {
    fontSize: 7,
    color: "#3B82F6",
    textDecoration: "underline" as const,
  },
  pageNumber: {
    position: "absolute" as const,
    fontSize: 8,
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: "center" as const,
    color: "#666666",
  },
  highlightedText: {
    backgroundColor: "#FFEB3B",
  },
  imageContainer: {
    marginVertical: 8,
    display: "flex" as const,
    flexDirection: "column" as const,
    alignItems: "center" as const,
  },
  image: {
    maxWidth: "100%",
    height: "auto",
    marginBottom: 4,
  },
  imageCaption: {
    fontSize: 8,
    color: "#666666",
    textAlign: "center" as const,
    marginTop: 4,
  },
  imageDimensions: {
    fontSize: 7,
    color: "#666666",
    textAlign: "center" as const,
  },
};

interface ScriptPDFGeneratorProps {
  script: ScriptWithRelations;
}

export const ScriptPDFGenerator = memo(function ScriptPDFGenerator({ script }: ScriptPDFGeneratorProps) {
  const characters = script.characters;

  const [isGenerating, setIsGenerating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCharacters, setSelectedCharacters] = useState<string[]>([]);

  const onGeneratePDF = useCallback(async () => {
    setIsDialogOpen(false);
    setIsGenerating(true);
    
    try {
      const { pdf } = await import('@react-pdf/renderer');
      const { Document, Page, Text, View, StyleSheet, Image } = await import('@react-pdf/renderer');
      
      const pdfStyles = StyleSheet.create(styles);
      
      const MyDocument = () => (
        <Document>
          <Page size="A4" style={pdfStyles.page}>
            <Text style={pdfStyles.title}>Theatre Script</Text>
            
            {script.items.map((item, index: number) => (
              <View key={index} style={pdfStyles.section}>
                <Text style={pdfStyles.lineNumber}>
                  {(index + 1).toString().padStart(2, '0')}
                </Text>
                
                <View style={pdfStyles.content}>
                  {item.type === "dialogue" && item.dialogue && (
                    <>
                      <Text style={[
                        pdfStyles.dialogueHeader,
                        { color: characters.find((c) => c.id === item.dialogue?.characterId)?.color || "#000000" },
                        selectedCharacters.includes(item.dialogue?.characterId || "") ? pdfStyles.highlightedText : {}
                      ]}>
                        {`${characters.find((c) => c.id === item.dialogue?.characterId)?.stageName || "Character"} (${characters.find((c) => c.id === item.dialogue?.characterId)?.realName || "Unknown"}):`}
                      </Text>
                      <Text style={[
                        pdfStyles.dialogueText,
                        selectedCharacters.includes(item.dialogue?.characterId || "") ? pdfStyles.highlightedText : {}
                      ]}>{item.dialogue.text}</Text>
                    </>
                  )}
                  
                  {item.type === "narration" && (
                    <>
                      {item.narration && (
                        <Text style={[
                          pdfStyles.dialogueHeader,
                          { color: characters.find((c) => c.id === item.narration?.characterId)?.color || "#000000" },
                          selectedCharacters.includes(item.narration?.characterId || "") ? pdfStyles.highlightedText : {}
                        ]}>
                          {`Narrateur - ${characters.find((c) => c.id === item.narration?.characterId)?.stageName || "Personnage"} (${characters.find((c) => c.id === item.narration?.characterId)?.realName || "Inconnu"}):`}
                        </Text>
                      )}
                      <Text style={[
                        pdfStyles.narrationText,
                        item.narration ? { marginLeft: 16 } : {},
                        item.narration && selectedCharacters.includes(item.narration?.characterId || "") ? pdfStyles.highlightedText : {}
                      ]}>{item.narration?.text || ""}</Text>
                    </>
                  )}
                  
                  {item.type === "lighting" && item.lighting && (
                    <View style={pdfStyles.technicalBlock}>
                      <Text style={pdfStyles.technicalHeader}>ÉCLAIRAGE:</Text>
                      <Text style={pdfStyles.technicalContent}>
                        Position: {item.lighting.position}
                        {item.lighting.color && `, Couleur: ${item.lighting.color}`}
                      </Text>
                    </View>
                  )}
                  
                  {item.type === "sound" && item.sound && (
                    <View style={pdfStyles.technicalBlock}>
                      <Text style={pdfStyles.technicalHeader}>SON:</Text>
                      <Text style={pdfStyles.technicalContent}>
                        {item.sound.name} ({item.sound.timecode})
                      </Text>
                      {item.sound.description && (
                        <Text style={[pdfStyles.technicalContent, { fontStyle: "italic" }]}>
                          {item.sound.description}
                        </Text>
                      )}
                      {item.sound.type === "url" && (
                        <Text style={pdfStyles.technicalUrl}>{item.sound.url}</Text>
                      )}
                      {item.sound.type === "youtube" && (
                        <Text style={pdfStyles.technicalUrl}>{item.sound.url}</Text>
                      )}
                      {item.sound.type === "base64" && (
                        <Text style={pdfStyles.technicalContent}>Fichier audio: {item.sound.name}</Text>
                      )}
                    </View>
                  )}
                  
                  {item.type === "image" && item.image && (
                    <View style={pdfStyles.imageContainer}>
                      <Image
                        src={item.image.url}
                        style={[
                          pdfStyles.image,
                          {
                            width: item.image.width || 400,
                            height: item.image.height || 300,
                            objectFit: "contain",
                          },
                        ]}
                      />
                      <Text style={pdfStyles.imageCaption}>
                        {item.image.caption || "Image"}
                      </Text>
                      <Text style={pdfStyles.imageDimensions}>
                        {item.image.width || "?"}x{item.image.height || "?"}px
                      </Text>
                      {item.image.type === "url" && (
                        <Text style={pdfStyles.technicalUrl}>{item.image.url}</Text>
                      )}
                    </View>
                  )}
                  
                  {item.type === "staging" && item.staging && (
                    <View style={pdfStyles.technicalBlock}>
                      <Text style={pdfStyles.technicalHeader}>MISE EN SCÈNE - {item.staging.item}:</Text>
                      <Text style={pdfStyles.technicalContent}>Position: {item.staging.position}</Text>
                      {item.staging.description && (
                        <Text style={[pdfStyles.technicalContent, { fontStyle: "italic" }]}>
                          {item.staging.description}
                        </Text>
                      )}
                    </View>
                  )}
                  
                  {item.type === "movement" && item.movement && (
                    <View style={pdfStyles.technicalBlock}>
                      <Text style={pdfStyles.technicalHeader}>MOUVEMENT:</Text>
                      <Text style={pdfStyles.technicalContent}>
                        {characters.find((c) => c.id === item.movement?.characterId)?.stageName || "Personnage"}: 
                        {` ${item.movement.from} → ${item.movement.to}`}
                      </Text>
                      {item.movement.description && (
                        <Text style={[pdfStyles.technicalContent, { fontStyle: "italic" }]}>
                          {item.movement.description}
                        </Text>
                      )}
                    </View>
                  )}
                </View>
              </View>
            ))}
            
            <Text 
              style={pdfStyles.pageNumber} 
              render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} 
            />
          </Page>
        </Document>
      );
      
      const blob = await pdf(<MyDocument />).toBlob();
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `theatre-script-${new Date().toISOString().slice(0, 10)}.pdf`;
      link.click();
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [script, characters, selectedCharacters]);

  const toggleCharacter = useCallback((characterId: string) => {
    setSelectedCharacters(prev => 
      prev.includes(characterId)
        ? prev.filter(id => id !== characterId)
        : [...prev, characterId]
    );
  }, []);

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          onClick={() => setIsDialogOpen(true)}
          disabled={isGenerating}
        >
          <FileTextIcon />
          {isGenerating ? "Génération..." : "Générer PDF"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Sélectionner les personnages à surligner</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] mt-4">
          <div className="space-y-4 p-2">
            {characters.map((character) => (
              <div key={character.id} className="flex items-center space-x-2">
                <Checkbox
                  id={character.id}
                  checked={selectedCharacters.includes(character.id)}
                  onCheckedChange={() => toggleCharacter(character.id)}
                />
                <Label
                  htmlFor={character.id}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {character.stageName} ({character.realName})
                </Label>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="flex justify-end space-x-2 mt-4">
          <Button
            variant="outline"
            onClick={() => setIsDialogOpen(false)}
          >
            Annuler
          </Button>
          <Button
            onClick={onGeneratePDF}
            disabled={isGenerating}
          >
            Générer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
});
