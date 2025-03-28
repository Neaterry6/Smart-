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

  // Helper function to create a nav link with proper styling
  const NavLink = ({ to, isActive, isDisabled, icon, label }: {
    to: string, 
    isActive: boolean, 
    isDisabled?: boolean, 
    icon: React.ReactNode, 
    label: string
  }) => (
    <Link href={to}>
      <div
        className={`
          whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center cursor-pointer
          ${isActive
            ? "border-primary-500 text-primary-600"
            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}
          ${isDisabled && "opacity-50 pointer-events-none"}
        `}
      >
        {icon}
        {label}
      </div>
    </Link>
  );

  return (
    <div className="border-b border-gray-200 mb-8">
      <nav className="-mb-px flex space-x-8">
        <NavLink 
          to="/upload" 
          isActive={activeTab === "upload"} 
          icon={<Upload className="mr-1 h-4 w-4" />} 
          label="Upload" 
        />
        
        <NavLink 
          to={effectiveDocumentId ? `/flashcards/${effectiveDocumentId}` : "/upload"} 
          isActive={activeTab === "flashcards"} 
          isDisabled={!effectiveDocumentId}
          icon={<FlashcardIcon className="mr-1 h-4 w-4" />} 
          label="Flashcards" 
        />
        
        <NavLink 
          to={effectiveDocumentId ? `/quiz/${effectiveDocumentId}` : "/upload"} 
          isActive={activeTab === "quiz"} 
          isDisabled={!effectiveDocumentId}
          icon={<QuizIcon className="mr-1 h-4 w-4" />} 
          label="Quiz" 
        />
        
        <NavLink 
          to={effectiveDocumentId ? `/summary/${effectiveDocumentId}` : "/upload"} 
          isActive={activeTab === "summary"} 
          isDisabled={!effectiveDocumentId}
          icon={<FileText className="mr-1 h-4 w-4" />} 
          label="Summary" 
        />
      </nav>
    </div>
  );
}
