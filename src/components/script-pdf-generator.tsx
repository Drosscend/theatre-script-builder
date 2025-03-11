"use client";

import { useState, useCallback, memo } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { FileTextIcon } from "lucide-react";
import { Character, ScriptItemType } from "./script-editor";

// Définition des styles pour le PDF
const styles = {
  page: {
    flexDirection: "column" as const,
    backgroundColor: "#FFFFFF",
    padding: 30,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: "center" as const,
    fontWeight: "bold" as const,
  },
  section: {
    marginBottom: 10,
  },
  itemHeader: {
    fontSize: 12,
    fontWeight: "bold" as const,
    marginBottom: 3,
  },
  itemContent: {
    fontSize: 10,
    marginBottom: 5,
  },
  characterName: {
    fontWeight: "bold" as const,
  },
  dialogueText: {
    marginLeft: 10,
  },
  narrationText: {
    fontStyle: "italic" as const,
  },
  technicalInfo: {
    fontSize: 9,
    color: "#666666",
  },
  pageNumber: {
    position: "absolute" as const,
    fontSize: 10,
    bottom: 20,
    left: 0,
    right: 0,
    textAlign: "center" as const,
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
            <Text style={pdfStyles.title}>Script de Théâtre</Text>
            
            {script.map((item, index: number) => (
              <View key={index} style={pdfStyles.section}>
                {item.type === "dialogue" && item.character && (
                  <>
                    <Text style={pdfStyles.characterName}>
                      {characters.find((c) => c.id === item.character)?.stageName || "Personnage"}:
                    </Text>
                    <Text style={pdfStyles.dialogueText}>{item.text}</Text>
                  </>
                )}
                
                {item.type === "narration" && (
                  <Text style={pdfStyles.narrationText}>{item.text}</Text>
                )}
                
                {item.type === "lighting" && item.lighting && (
                  <>
                    <Text style={pdfStyles.itemHeader}>ÉCLAIRAGE:</Text>
                    <Text style={pdfStyles.itemContent}>
                      Position: {item.lighting.position}
                      {item.lighting.color && `, Couleur: ${item.lighting.color}`}
                    </Text>
                  </>
                )}
                
                {item.type === "sound" && item.sound && (
                  <>
                    <Text style={pdfStyles.itemHeader}>SON:</Text>
                    <Text style={pdfStyles.itemContent}>
                      {item.sound.description} ({item.sound.timecode})
                    </Text>
                    <Text style={pdfStyles.technicalInfo}>{item.sound.url}</Text>
                  </>
                )}
                
                {item.type === "image" && item.image && (
                  <>
                    <Text style={pdfStyles.itemHeader}>IMAGE:</Text>
                    <Text style={pdfStyles.technicalInfo}>{item.image.url}</Text>
                    {item.image.caption && (
                      <Text style={pdfStyles.itemContent}>{item.image.caption}</Text>
                    )}
                  </>
                )}
                
                {item.type === "staging" && item.staging && (
                  <>
                    <Text style={pdfStyles.itemHeader}>MISE EN SCÈNE - {item.staging.item}:</Text>
                    <Text style={pdfStyles.itemContent}>Position: {item.staging.position}</Text>
                    {item.staging.description && (
                      <Text style={pdfStyles.itemContent}>{item.staging.description}</Text>
                    )}
                  </>
                )}
                
                {item.type === "movement" && item.movement && (
                  <>
                    <Text style={pdfStyles.itemHeader}>MOUVEMENT:</Text>
                    <Text style={pdfStyles.itemContent}>
                      {characters.find((c) => c.id === item.movement?.characterId)?.stageName || "Personnage"}: 
                      {` ${item.movement.from} → ${item.movement.to}`}
                    </Text>
                    {item.movement.description && (
                      <Text style={pdfStyles.itemContent}>{item.movement.description}</Text>
                    )}
                  </>
                )}
              </View>
            ))}
            
            <Text 
              style={pdfStyles.pageNumber} 
              render={({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) => `${pageNumber} / ${totalPages}`} 
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
