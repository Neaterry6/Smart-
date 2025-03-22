import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Document } from "@shared/schema";
import { 
  Upload, 
  CreditCard as FlashcardIcon, 
  HelpCircle as QuizIcon, 
  FileText 
} from "lucide-react";

interface TabNavigationProps {
  activeTab: "upload" | "flashcards" | "quiz" | "summary";
  documentId?: number;
}

export default function TabNavigation({ activeTab, documentId }: TabNavigationProps) {
  const [location] = useLocation();
  
  const { data: documents } = useQuery<Document[]>({
    queryKey: ["/api/documents"],
    enabled: activeTab !== "upload",
  });
  
  // Get the first completed document if no documentId is provided
  const firstCompletedDoc = documents?.find(doc => doc.processingStatus === "completed");
  const effectiveDocumentId = documentId || firstCompletedDoc?.id;

  return (
    <div className="border-b border-gray-200 mb-8">
      <nav className="-mb-px flex space-x-8">
        <Link href="/upload">
          <a
            className={`
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center
              ${activeTab === "upload"
                ? "border-primary-500 text-primary-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}
            `}
          >
            <Upload className="mr-1 h-4 w-4" />
            Upload
          </a>
        </Link>
        
        <Link href={effectiveDocumentId ? `/flashcards/${effectiveDocumentId}` : "/upload"}>
          <a
            className={`
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center
              ${activeTab === "flashcards"
                ? "border-primary-500 text-primary-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}
              ${!effectiveDocumentId && "opacity-50 pointer-events-none"}
            `}
          >
            <FlashcardIcon className="mr-1 h-4 w-4" />
            Flashcards
          </a>
        </Link>
        
        <Link href={effectiveDocumentId ? `/quiz/${effectiveDocumentId}` : "/upload"}>
          <a
            className={`
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center
              ${activeTab === "quiz"
                ? "border-primary-500 text-primary-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}
              ${!effectiveDocumentId && "opacity-50 pointer-events-none"}
            `}
          >
            <QuizIcon className="mr-1 h-4 w-4" />
            Quiz
          </a>
        </Link>
        
        <Link href={effectiveDocumentId ? `/summary/${effectiveDocumentId}` : "/upload"}>
          <a
            className={`
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center
              ${activeTab === "summary"
                ? "border-primary-500 text-primary-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}
              ${!effectiveDocumentId && "opacity-50 pointer-events-none"}
            `}
          >
            <FileText className="mr-1 h-4 w-4" />
            Summary
          </a>
        </Link>
      </nav>
    </div>
  );
}
