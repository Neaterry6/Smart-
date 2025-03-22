import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Document } from "@shared/schema";
import { CheckCircle, Circle, RefreshCw } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ProcessingStateProps {
  documentId: number;
}

export default function ProcessingState({ documentId }: ProcessingStateProps) {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState<string>("Extracting text from PDF");
  const [processingStage, setProcessingStage] = useState(0);
  
  const { data: document, isLoading } = useQuery<Document>({
    queryKey: [`/api/documents/${documentId}`],
    refetchInterval: 3000, // Poll every 3 seconds
  });
  
  useEffect(() => {
    // Simulate progress
    const stages = [
      "Extracting text from PDF",
      "Identifying key concepts",
      "Creating flashcards",
      "Generating quiz questions",
      "Producing summary"
    ];
    
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        
        // Update processing stage based on progress
        const newProgress = prev + 1;
        if (newProgress < 20) {
          setProcessingStage(0);
          setStatusText(stages[0]);
        } else if (newProgress < 40) {
          setProcessingStage(1);
          setStatusText(stages[1]);
        } else if (newProgress < 60) {
          setProcessingStage(2);
          setStatusText(stages[2]);
        } else if (newProgress < 80) {
          setProcessingStage(3);
          setStatusText(stages[3]);
        } else {
          setProcessingStage(4);
          setStatusText(stages[4]);
        }
        
        return newProgress;
      });
    }, 300);
    
    return () => clearInterval(interval);
  }, []);
  
  useEffect(() => {
    // Check if processing is complete, then refresh the data
    if (document?.processingStatus === "completed") {
      // Invalidate and refetch all related queries
      queryClient.invalidateQueries({ queryKey: [`/api/documents/${documentId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/documents/${documentId}/flashcards`] });
      queryClient.invalidateQueries({ queryKey: [`/api/documents/${documentId}/quizzes`] });
      queryClient.invalidateQueries({ queryKey: [`/api/documents/${documentId}/summary`] });
      
      // Redirect to the appropriate tab
      window.location.reload();
    }
  }, [document, documentId]);
  
  return (
    <div className="p-8">
      <div className="text-center">
        <div className="mb-4 loading-indicator">
          <div className="animate-spin h-12 w-12 border-t-2 border-primary-600 rounded-full"></div>
        </div>
        <h2 className="text-xl font-medium text-gray-900 mb-2">Processing Your Document</h2>
        <p className="text-gray-600 mb-6">Our AI is analyzing your PDF and creating study materials</p>
        
        <div className="max-w-md mx-auto">
          <div className="relative pt-1">
            <Progress value={progress} className="h-2 mb-4" />
            <div className="text-center text-sm text-gray-500">{statusText} ({progress}%)</div>
          </div>
        </div>
        
        <div className="mt-8 max-w-md mx-auto text-left bg-gray-50 p-4 rounded-md border border-gray-200">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Processing Steps:</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center">
              <CheckCircle className="text-green-500 h-4 w-4 mr-2" />
              <span className="text-gray-600">Extracting text from PDF</span>
            </li>
            <li className="flex items-center">
              {processingStage >= 1 ? (
                <CheckCircle className="text-green-500 h-4 w-4 mr-2" />
              ) : (
                <Circle className="text-gray-300 h-4 w-4 mr-2" />
              )}
              <span className={processingStage >= 1 ? "text-gray-600" : "text-gray-400"}>
                Identifying key concepts
              </span>
            </li>
            <li className="flex items-center">
              {processingStage >= 2 ? (
                <CheckCircle className="text-green-500 h-4 w-4 mr-2" />
              ) : processingStage === 2 ? (
                <RefreshCw className="text-primary-500 h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Circle className="text-gray-300 h-4 w-4 mr-2" />
              )}
              <span className={processingStage >= 2 ? "text-gray-600" : processingStage === 2 ? "text-gray-900" : "text-gray-400"}>
                Creating flashcards
              </span>
            </li>
            <li className="flex items-center">
              {processingStage >= 3 ? (
                <CheckCircle className="text-green-500 h-4 w-4 mr-2" />
              ) : processingStage === 3 ? (
                <RefreshCw className="text-primary-500 h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Circle className="text-gray-300 h-4 w-4 mr-2" />
              )}
              <span className={processingStage >= 3 ? "text-gray-600" : processingStage === 3 ? "text-gray-900" : "text-gray-400"}>
                Generating quiz questions
              </span>
            </li>
            <li className="flex items-center">
              {processingStage >= 4 ? (
                <CheckCircle className="text-green-500 h-4 w-4 mr-2" />
              ) : processingStage === 4 ? (
                <RefreshCw className="text-primary-500 h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Circle className="text-gray-300 h-4 w-4 mr-2" />
              )}
              <span className={processingStage >= 4 ? "text-gray-600" : processingStage === 4 ? "text-gray-900" : "text-gray-400"}>
                Producing summary
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
