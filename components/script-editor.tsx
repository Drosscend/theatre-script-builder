"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ScriptItem from "@/components/script-item"
import AddItemDialog from "@/components/add-item-dialog"
import CharactersDialog from "@/components/characters-dialog"
import { PlusIcon, DownloadIcon, UploadIcon, UsersIcon, Trash2Icon } from "lucide-react"
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import Image from "next/image";

export type Character = {
    id: string
    realName: string
    stageName: string
    role: string
    color: string
}

export type LightingEffect = {
    position: string
    color: string
}

export type SoundEffect = {
    url: string
    timecode: string
    description: string
}

export type ScriptItemType = {
    id: string
    type: "dialogue" | "narration" | "lighting" | "sound" | "image" | "staging" | "movement"
    character?: string
    text?: string
    lighting?: LightingEffect
    sound?: SoundEffect
    image?: {
        url: string
        caption?: string
    }
    staging?: {
        item: string
        position: string
        description?: string
    }
    movement?: {
        character: string
        from: string
        to: string
        description?: string
    }
    tags?: string[]
}

export default function ScriptEditor() {
    const [scriptItems, setScriptItems] = useState<ScriptItemType[]>([])
    const [characters, setCharacters] = useState<Character[]>([])
    const [isAddItemOpen, setIsAddItemOpen] = useState(false)
    const [isCharactersOpen, setIsCharactersOpen] = useState(false)
    const [selectedItems, setSelectedItems] = useState<string[]>([])

    const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor))

    useEffect(() => {
        // Load data from localStorage on component mount
        const savedScript = localStorage.getItem("theatreScript")
        const savedCharacters = localStorage.getItem("theatreCharacters")

        if (savedScript) {
            try {
                setScriptItems(JSON.parse(savedScript))
            } catch (e) {
                console.error("Failed to parse saved script", e)
            }
        }

        if (savedCharacters) {
            try {
                setCharacters(JSON.parse(savedCharacters))
            } catch (e) {
                console.error("Failed to parse saved characters", e)
            }
        }
    }, [])

    useEffect(() => {
        // Save data to localStorage whenever it changes
        localStorage.setItem("theatreScript", JSON.stringify(scriptItems))
        localStorage.setItem("theatreCharacters", JSON.stringify(characters))
    }, [scriptItems, characters])

    const handleAddItem = (item: ScriptItemType) => {
        setScriptItems([...scriptItems, item])
        setIsAddItemOpen(false)
    }

    const handleAddItemAtPosition = (item: ScriptItemType, targetId: string, position: "before" | "after") => {
        const targetIndex = scriptItems.findIndex((item) => item.id === targetId)
        if (targetIndex === -1) return

        const newIndex = position === "after" ? targetIndex + 1 : targetIndex
        const newItems = [...scriptItems]
        newItems.splice(newIndex, 0, item)
        setScriptItems(newItems)
    }

    const handleUpdateItem = (updatedItem: ScriptItemType) => {
        setScriptItems(scriptItems.map((item) => (item.id === updatedItem.id ? updatedItem : item)))
    }

    const handleDeleteItem = (id: string) => {
        setScriptItems(scriptItems.filter((item) => item.id !== id))
    }

    const handleSelectItem = (id: string, isSelected: boolean) => {
        if (isSelected) {
            setSelectedItems([...selectedItems, id])
        } else {
            setSelectedItems(selectedItems.filter((itemId) => itemId !== id))
        }
    }

    const handleDeleteSelected = () => {
        setScriptItems(scriptItems.filter((item) => !selectedItems.includes(item.id)))
        setSelectedItems([])
    }

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event

        if (active.id !== over?.id) {
            setScriptItems((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id)
                const newIndex = items.findIndex((item) => item.id === over?.id)

                return arrayMove(items, oldIndex, newIndex)
            })
        }
    }

    const exportScript = () => {
        const dataStr = JSON.stringify({ script: scriptItems, characters }, null, 2)
        const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`

        const exportFileDefaultName = `theatre-script-${new Date().toISOString().slice(0, 10)}.json`

        const linkElement = document.createElement("a")
        linkElement.setAttribute("href", dataUri)
        linkElement.setAttribute("download", exportFileDefaultName)
        linkElement.click()
    }

    const importScript = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (e) => {
            try {
                const content = e.target?.result as string
                const parsed = JSON.parse(content)

                if (parsed.script && Array.isArray(parsed.script)) {
                    setScriptItems(parsed.script)
                }

                if (parsed.characters && Array.isArray(parsed.characters)) {
                    setCharacters(parsed.characters)
                }
            } catch (error) {
                console.error("Failed to parse imported file", error)
                alert("Le fichier importé n'est pas valide.")
            }
        }
        reader.readAsText(file)

        // Reset the input value so the same file can be imported again if needed
        event.target.value = ""
    }

    const getCharacterColor = (characterId: string) => {
        const character = characters.find((c) => c.id === characterId)
        return character?.color || "#e2e8f0"
    }

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Éditeur de Pièce de Théâtre</h1>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setIsCharactersOpen(true)}>
                        <UsersIcon />
                        Personnages
                    </Button>
                    <Button variant="outline" onClick={exportScript}>
                        <DownloadIcon />
                        Exporter
                    </Button>
                    <div className="relative">
                        <Button variant="outline">
                            <UploadIcon />
                            Importer
                            <input
                                type="file"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                accept=".json"
                                onChange={importScript}
                            />
                        </Button>
                    </div>
                </div>
            </div>

            <Tabs defaultValue="script" className="w-full">
                <TabsList className="grid w-full max-w-md grid-cols-2">
                    <TabsTrigger value="script">Script</TabsTrigger>
                    <TabsTrigger value="preview">Aperçu</TabsTrigger>
                </TabsList>
                <TabsContent value="script" className="space-y-4">
                    <Card className="p-4">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">Contenu du script</h2>
                            <div className="flex gap-2">
                                {selectedItems.length > 0 && (
                                    <Button variant="destructive" onClick={handleDeleteSelected}>
                                        <Trash2Icon />
                                        Supprimer ({selectedItems.length})
                                    </Button>
                                )}
                                <Button onClick={() => setIsAddItemOpen(true)}>
                                    <PlusIcon />
                                    Ajouter un élément
                                </Button>
                            </div>
                        </div>

                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                            modifiers={[restrictToVerticalAxis]}
                        >
                            <SortableContext items={scriptItems.map((item) => item.id)} strategy={verticalListSortingStrategy}>
                                <div className="space-y-3">
                                    {scriptItems.length === 0 ? (
                                        <div className="text-center py-8 text-muted-foreground">
                                            {`Aucun élément dans le script. Cliquez sur "Ajouter un élément" pour commencer.`}
                                        </div>
                                    ) : (
                                        scriptItems.map((item) => (
                                            <ScriptItem
                                                key={item.id}
                                                item={item}
                                                characters={characters}
                                                characterColor={item.character ? getCharacterColor(item.character) : undefined}
                                                onUpdate={handleUpdateItem}
                                                onDelete={handleDeleteItem}
                                                onAddBefore={(newItem) => handleAddItemAtPosition(newItem, item.id, "before")}
                                                onAddAfter={(newItem) => handleAddItemAtPosition(newItem, item.id, "after")}
                                                isSelected={selectedItems.includes(item.id)}
                                                onSelect={(isSelected) => handleSelectItem(item.id, isSelected)}
                                            />
                                        ))
                                    )}
                                </div>
                            </SortableContext>
                        </DndContext>
                    </Card>
                </TabsContent>

                <TabsContent value="preview" className="space-y-4">
                    <Card className="p-6">
                        <h2 className="text-xl font-semibold mb-4">Aperçu du script</h2>
                        <div className="prose max-w-none">
                            {scriptItems.map((item) => {
                                const character = item.character ? characters.find((c) => c.id === item.character) : null

                                if (item.type === "dialogue" && character) {
                                    // Process character mentions in dialogue
                                    const processedText = item.text

                                    return (
                                        <div key={item.id} className="mb-4">
                                            <p className="font-bold" style={{ color: character.color }}>
                                                {`${character.stageName}:`}
                                            </p>
                                            <p className="ml-8">{processedText}</p>
                                        </div>
                                    )
                                } else if (item.type === "narration") {
                                    // Process character mentions in narration
                                    const processedText = item.text

                                    // If narration has an associated character, display their name
                                    const narratorPrefix = character ? (
                                        <span className="font-bold" style={{ color: character.color }}>
                                            {`${character.stageName}: `}
                                        </span>
                                    ) : null

                                    return (
                                        <div key={item.id} className="mb-4 italic">
                                            {narratorPrefix}
                                            <p>{processedText}</p>
                                        </div>
                                    )
                                } else if (item.type === "lighting" && item.lighting) {
                                    return (
                                        <div key={item.id} className="mb-4 p-2 bg-slate-100 dark:bg-slate-800 rounded">
                                            <p className="text-sm font-semibold">LUMIÈRE:</p>
                                            <p className="text-sm">
                                                Position: {`${item.lighting.position}`}, Couleur:{" "}
                                                <span
                                                    className="inline-block w-3 h-3 rounded-full"
                                                    style={{ backgroundColor: item.lighting.color }}
                                                ></span>{" "}
                                                {`${item.lighting.color}`}
                                            </p>
                                        </div>
                                    )
                                } else if (item.type === "sound" && item.sound) {
                                    return (
                                        <div key={item.id} className="mb-4 p-2 bg-slate-100 dark:bg-slate-800 rounded">
                                            <p className="text-sm font-semibold">SON:</p>
                                            <p className="text-sm">
                                                {`${item.sound.description}`} ({`${item.sound.timecode}`})
                                            </p>
                                            <p className="text-xs text-blue-500 underline">{`${item.sound.url}`}</p>
                                        </div>
                                    )
                                } else if (item.type === "image" && item.image) {
                                    return (
                                        <div key={item.id} className="mb-4 p-2 bg-slate-100 dark:bg-slate-800 rounded">
                                            <p className="text-sm font-semibold">IMAGE:</p>
                                            <div className="my-2">
                                                <Image
                                                    src={item.image.url || "/placeholder.svg?height=300&width=400"}
                                                    alt={item.image.caption || "Image de scène"}
                                                    className="max-h-64 object-contain mx-auto border rounded"
                                                />
                                            </div>
                                            {item.image.caption && <p className="text-sm text-center italic mt-1">{`{${item.image.caption}}`}</p>}
                                        </div>
                                    )
                                } else if (item.type === "staging" && item.staging) {
                                    return (
                                        <div key={item.id} className="mb-4 p-2 bg-slate-100 dark:bg-slate-800 rounded">
                                            <p className="text-sm font-semibold">MISE EN SCÈNE - {`${item.staging.item}`}:</p>
                                            <p className="text-sm">Position: {`${item.staging.position}`}</p>
                                            {item.staging.description && <p className="text-sm italic mt-1">{`${item.staging.description}`}</p>}
                                        </div>
                                    )
                                } else if (item.type === "movement" && item.movement) {
                                    const movingCharacter = characters.find((c) => c.id === item.movement?.character)
                                    return (
                                        <div key={item.id} className="mb-4 p-2 bg-slate-100 dark:bg-slate-800 rounded">
                                            <p className="text-sm font-semibold">MOUVEMENT:</p>
                                            <p className="text-sm">
                                                {`${movingCharacter?.stageName || "Personnage"}`}: {`${item.movement.from}`} → {`${item.movement.to}`}
                                            </p>
                                            {item.movement.description && <p className="text-sm italic mt-1">{`${item.movement.description}`}</p>}
                                        </div>
                                    )
                                }
                                return null
                            })}
                        </div>
                    </Card>
                </TabsContent>
            </Tabs>

            <AddItemDialog
                open={isAddItemOpen}
                onOpenChange={setIsAddItemOpen}
                onAdd={handleAddItem}
                characters={characters}
            />

            <CharactersDialog
                open={isCharactersOpen}
                onOpenChange={setIsCharactersOpen}
                characters={characters}
                setCharacters={setCharacters}
            />
        </div>
    )
}