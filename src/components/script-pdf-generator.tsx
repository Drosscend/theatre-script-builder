"use client";

import { useState, useCallback, memo } from "react";
import { Button } from "@/components/ui/button";
import { FileTextIcon } from "lucide-react";
import { Character, ScriptItemType } from "./script-editor";

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
};

interface ScriptPDFGeneratorProps {
  script: Array<typeof ScriptItemType & {
    id: string;
    type: "dialogue" | "narration" | "lighting" | "sound" | "image" | "staging" | "movement";
  }>;
  characters: Array<typeof Character & {
    id: string;
    realName: string;
    stageName: string;
    role: string;
    color: string;
  }>;
}

export const ScriptPDFGenerator = memo(function ScriptPDFGenerator({ script, characters }: ScriptPDFGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = useCallback(async () => {
    setIsGenerating(true);
    
    try {
      // Import dynamiquement les modules react-pdf uniquement côté client
      const { pdf } = await import('@react-pdf/renderer');
      const { Document, Page, Text, View, StyleSheet } = await import('@react-pdf/renderer');
      
      // Créer les styles avec StyleSheet
      const pdfStyles = StyleSheet.create(styles);
      
      // Créer le document PDF
      const MyDocument = () => (
        <Document>
          <Page size="A4" style={pdfStyles.page}>
            <Text style={pdfStyles.title}>Theatre Script</Text>
            
            {script.map((item, index: number) => (
              <View key={index} style={pdfStyles.section}>
                <Text style={pdfStyles.lineNumber}>
                  {(index + 1).toString().padStart(2, '0')}
                </Text>
                
                <View style={pdfStyles.content}>
                  {item.type === "dialogue" && item.character && (
                    <>
                      <Text style={[
                        pdfStyles.dialogueHeader,
                        { color: characters.find((c) => c.id === item.character)?.color || "#000000" }
                      ]}>
                        {`${characters.find((c) => c.id === item.character)?.stageName || "Character"} (${characters.find((c) => c.id === item.character)?.realName || "Unknown"}):`}
                      </Text>
                      <Text style={pdfStyles.dialogueText}>{item.text}</Text>
                    </>
                  )}
                  
                  {item.type === "narration" && (
                    <>
                      {item.character && (
                        <Text style={[
                          pdfStyles.dialogueHeader,
                          { color: characters.find((c) => c.id === item.character)?.color || "#000000" }
                        ]}>
                          {`Narrateur - ${characters.find((c) => c.id === item.character)?.stageName || "Personnage"} (${characters.find((c) => c.id === item.character)?.realName || "Inconnu"}):`}
                        </Text>
                      )}
                      <Text style={[
                        pdfStyles.narrationText,
                        item.character ? { marginLeft: 16 } : {}
                      ]}>{item.text}</Text>
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
                        {item.sound.description} ({item.sound.timecode})
                      </Text>
                      <Text style={pdfStyles.technicalUrl}>{item.sound.url}</Text>
                    </View>
                  )}
                  
                  {item.type === "image" && item.image && (
                    <View style={pdfStyles.technicalBlock}>
                      <Text style={pdfStyles.technicalHeader}>IMAGE:</Text>
                      <Text style={pdfStyles.technicalUrl}>{item.image.url}</Text>
                      {item.image.caption && (
                        <Text style={pdfStyles.technicalContent}>{item.image.caption}</Text>
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
              render={({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) => 
                `${pageNumber} / ${totalPages}`
              } 
            />
          </Page>
        </Document>
      );
      
      // Générer le blob PDF
      const blob = await pdf(<MyDocument />).toBlob();
      
      // Créer une URL pour le blob
      const url = URL.createObjectURL(blob);
      
      // Créer un lien de téléchargement et cliquer dessus
      const link = document.createElement('a');
      link.href = url;
      link.download = `theatre-script-${new Date().toISOString().slice(0, 10)}.pdf`;
      link.click();
      
      // Nettoyer l'URL
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [script, characters]);

  return (
    <Button 
      variant="outline" 
      onClick={generatePDF} 
      disabled={isGenerating}
    >
      <FileTextIcon />
      {isGenerating ? "Génération..." : "Générer PDF"}
    </Button>
  );
});
