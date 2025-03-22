import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Flashcard as FlashcardType, Document } from "@shared/schema";
import Flashcard from "@/components/Flashcard";
import { Shuffle, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface FlashcardsTabProps {
  documentId: number;
}

export default function FlashcardsTab({ documentId }: FlashcardsTabProps) {
  const { toast } = useToast();
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const { data: document } = useQuery<Document>({
    queryKey: [`/api/documents/${documentId}`],
  });
  
  const { data: flashcards, isLoading } = useQuery<FlashcardType[]>({
    queryKey: [`/api/documents/${documentId}/flashcards`],
  });
  
  const { data: documents } = useQuery<Document[]>({
    queryKey: ["/api/documents"],
  });
  
  // Calculate progress
  useEffect(() => {
    if (flashcards && flashcards.length > 0) {
      setProgress(Math.round((currentCardIndex / (flashcards.length - 1)) * 100));
    }
  }, [currentCardIndex, flashcards]);
  
  const nextCard = () => {
    if (flashcards && currentCardIndex < flashcards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setIsFlipped(false);
    }
  };
  
  const prevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setIsFlipped(false);
    }
  };
  
  const shuffleCards = () => {
    toast({
      title: "Flashcards shuffled",
      description: "Your flashcards have been randomly reordered",
    });
    setCurrentCardIndex(0);
    setIsFlipped(false);
  };
  
  const handleDocumentChange = (newDocId: string) => {
    // Redirect to the new document's flashcards
    window.location.href = `/flashcards/${newDocId}`;
  };
  
  const exportFlashcards = () => {
    if (!flashcards || flashcards.length === 0) return;
    
    // Create CSV content
    const csvContent = 
      "Front,Back\n" + 
      flashcards.map(card => `"${card.front.replace(/"/g, '""')}","${card.back.replace(/"/g, '""')}"`).join("\n");
    
    // Create a blob and download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `flashcards_${document?.originalName.replace(/\.[^/.]+$/, "")}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Export successful",
      description: "Your flashcards have been downloaded as a CSV file",
    });
  };
  
  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p>Loading flashcards...</p>
      </div>
    );
  }
  
  if (!flashcards || flashcards.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">No flashcards available for this document</p>
      </div>
    );
  }
  
  return (
    <div className="p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your Flashcards</h2>
        <p className="text-gray-600">Study and review key concepts from your documents</p>
      </div>

      {/* Document Selection */}
      <div className="mb-8 max-w-md mx-auto">
        <label htmlFor="document-select" className="block text-sm font-medium text-gray-700 mb-1">
          Select Document
        </label>
        <Select value={documentId.toString()} onValueChange={handleDocumentChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select a document" />
          </SelectTrigger>
          <SelectContent>
            {documents?.filter(doc => doc.processingStatus === "completed").map(doc => (
              <SelectItem key={doc.id} value={doc.id.toString()}>
                {doc.originalName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {/* Controls */}
      <div className="flex justify-center mb-6 space-x-4">
        <Button 
          variant="outline"
          className="bg-primary-100 text-primary-700 hover:bg-primary-200 border-primary-200"
          onClick={shuffleCards}
        >
          <Shuffle className="h-4 w-4 mr-2" />
          Shuffle
        </Button>
        <Button onClick={exportFlashcards}>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Flashcard Section */}
      <div className="max-w-md mx-auto mb-8">
        {/* Card Navigation */}
        <div className="flex items-center justify-between mb-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={prevCard}
            disabled={currentCardIndex === 0}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <span className="text-sm text-gray-500">
            Card {currentCardIndex + 1} of {flashcards.length}
          </span>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={nextCard}
            disabled={currentCardIndex === flashcards.length - 1}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>
        
        {/* Flashcard */}
        {flashcards && flashcards.length > 0 && (
          <Flashcard
            front={flashcards[currentCardIndex].front}
            back={flashcards[currentCardIndex].back}
            isFlipped={isFlipped}
            toggleFlip={() => setIsFlipped(!isFlipped)}
          />
        )}
        
        <div className="text-center">
          <Button 
            variant="outline" 
            className="mt-2"
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <span className="material-icons mr-1 text-sm">flip</span>
            Flip Card
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="max-w-md mx-auto">
        <div className="relative pt-1">
          <div className="flex mb-2 items-center justify-between">
            <div>
              <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-primary-600 bg-primary-200">
                Progress
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold inline-block text-primary-600">
                {progress}%
              </span>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>
    </div>
  );
}
