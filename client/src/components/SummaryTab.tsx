import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Document, Summary as SummaryType, TerminologyItem } from "@shared/schema";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface SummaryTabProps {
  documentId: number;
}

export default function SummaryTab({ documentId }: SummaryTabProps) {
  const { toast } = useToast();
  
  const { data: document } = useQuery<Document>({
    queryKey: [`/api/documents/${documentId}`],
  });
  
  const { data: summary, isLoading } = useQuery<SummaryType>({
    queryKey: [`/api/documents/${documentId}/summary`],
  });
  
  const { data: documents } = useQuery<Document[]>({
    queryKey: ["/api/documents"],
  });
  
  const handleDocumentChange = (newDocId: string) => {
    // Redirect to the new document's summary
    window.location.href = `/summary/${newDocId}`;
  };
  
  const downloadSummary = () => {
    if (!summary || !document) return;
    
    // Format the summary content
    let summaryText = `# Summary for ${document.originalName}\n\n`;
    summaryText += `Generated on ${format(new Date(), "MMM d, yyyy")}\n\n`;
    
    summaryText += "## Key Concepts\n\n";
    summary.keyConcepts.forEach(concept => {
      summaryText += `* ${concept}\n`;
    });
    
    summaryText += "\n## Important Terminology\n\n";
    (summary.terminology as TerminologyItem[]).forEach(term => {
      summaryText += `### ${term.term}\n${term.definition}\n\n`;
    });
    
    summaryText += "## Summary\n\n";
    summaryText += `${summary.summary}\n`;
    
    // Create a blob and download link
    const blob = new Blob([summaryText], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `summary_${document.originalName.replace(/\.[^/.]+$/, "")}.md`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Download successful",
      description: "Your summary has been downloaded as a Markdown file",
    });
  };
  
  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p>Loading summary...</p>
      </div>
    );
  }
  
  if (!summary) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">No summary available for this document</p>
      </div>
    );
  }
  
  return (
    <div className="p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Document Summary</h2>
        <p className="text-gray-600">Get a concise overview of your study materials</p>
      </div>

      {/* Document Selection */}
      <div className="mb-8 max-w-3xl mx-auto">
        <label htmlFor="summary-document" className="block text-sm font-medium text-gray-700 mb-1">
          Select Document
        </label>
        <Select value={documentId.toString()} onValueChange={handleDocumentChange}>
          <SelectTrigger id="summary-document">
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

      {/* Summary Content */}
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 bg-gray-50">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {document?.originalName} - Summary
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Generated on {format(new Date(), "MMM d, yyyy")}
            </p>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <h4 className="text-md font-medium text-gray-900 mb-4">Key Concepts</h4>
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              {summary.keyConcepts.map((concept, index) => (
                <li key={index}>{concept}</li>
              ))}
            </ul>
            
            <h4 className="text-md font-medium text-gray-900 mt-6 mb-4">Important Terminology</h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {(summary.terminology as TerminologyItem[]).map((term, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-md">
                  <h5 className="font-medium text-gray-900">{term.term}</h5>
                  <p className="text-sm text-gray-600">{term.definition}</p>
                </div>
              ))}
            </div>
            
            <h4 className="text-md font-medium text-gray-900 mt-6 mb-4">Summary</h4>
            <p className="text-gray-600">
              {summary.summary}
            </p>
            
            <div className="mt-6 flex justify-end">
              <Button onClick={downloadSummary}>
                <Download className="h-4 w-4 mr-2" />
                Download Summary
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
