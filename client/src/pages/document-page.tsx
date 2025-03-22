import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Document as DocType } from "@shared/schema";
import { ChatTab } from "@/components/ChatTab";
import FlashcardsTab from "@/components/FlashcardsTab";
import SummaryTab from "@/components/SummaryTab";
import QuizTab from "@/components/QuizTab";
import ProcessingState from "@/components/ProcessingState";
import { FileText, BookOpen, MessageSquare, BrainCircuit, Edit3 } from "lucide-react";

function DocumentPage() {
  const params = useParams<{ id: string }>();
  const documentId = parseInt(params.id);
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<string>("flashcards");

  const { data: document, isLoading } = useQuery<DocType>({
    queryKey: [`/api/documents/${documentId}`],
  });

  useEffect(() => {
    // If the URL has a hash (like /document/123#chat), use it to set the active tab
    const hash = window.location.hash.replace("#", "");
    if (hash) {
      setActiveTab(hash);
    }
  }, []);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Update URL hash for direct linking
    window.location.hash = value;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Document Not Found</h2>
        <p className="mb-4">The document you're looking for doesn't exist or has been removed.</p>
        <button 
          onClick={() => navigate('/upload')}
          className="text-primary hover:underline"
        >
          Return to Upload Page
        </button>
      </div>
    );
  }

  if (document.processingStatus === "processing") {
    return <ProcessingState documentId={documentId} />;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl font-bold">{document.originalName}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-500">
            <p>Uploaded on {new Date(document.uploadDate).toLocaleDateString()}</p>
            <p>File size: {(document.fileSize / 1024).toFixed(2)} KB</p>
          </div>
        </CardContent>
      </Card>

      <Tabs 
        value={activeTab} 
        onValueChange={handleTabChange} 
        className="w-full"
      >
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="flashcards" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Flashcards</span>
          </TabsTrigger>
          <TabsTrigger value="quiz" className="flex items-center gap-2">
            <BrainCircuit className="h-4 w-4" />
            <span className="hidden sm:inline">Quiz</span>
          </TabsTrigger>
          <TabsTrigger value="summary" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Summary</span>
          </TabsTrigger>
          <TabsTrigger value="notes" className="flex items-center gap-2">
            <Edit3 className="h-4 w-4" />
            <span className="hidden sm:inline">Notes</span>
          </TabsTrigger>
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Chat</span>
          </TabsTrigger>
        </TabsList>
        
        <div className="mt-6 bg-white p-6 rounded-lg border border-gray-200 min-h-[500px]">
          <TabsContent value="flashcards" className="h-full">
            <FlashcardsTab documentId={documentId} />
          </TabsContent>
          
          <TabsContent value="quiz" className="h-full">
            <QuizTab documentId={documentId} />
          </TabsContent>
          
          <TabsContent value="summary" className="h-full">
            <SummaryTab documentId={documentId} />
          </TabsContent>
          
          <TabsContent value="notes" className="h-full">
            <div className="text-center py-8">
              <h3 className="text-lg font-medium mb-2">Notes Feature</h3>
              <p className="text-gray-600">Take personal notes about this document. Feature coming soon!</p>
            </div>
          </TabsContent>
          
          <TabsContent value="chat" className="h-full">
            <ChatTab />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

export default DocumentPage;