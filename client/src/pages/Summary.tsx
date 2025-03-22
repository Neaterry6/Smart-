import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import TabNavigation from "@/components/TabNavigation";
import SummaryTab from "@/components/SummaryTab";
import ProcessingState from "@/components/ProcessingState";
import { Document } from "@shared/schema";

export default function Summary() {
  const { id } = useParams<{ id: string }>();
  const documentId = parseInt(id);

  const { data: document, isLoading } = useQuery<Document>({
    queryKey: [`/api/documents/${documentId}`],
  });

  return (
    <>
      <TabNavigation activeTab="summary" />
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>Loading document...</p>
          </div>
        ) : document?.processingStatus === "processing" ? (
          <ProcessingState documentId={documentId} />
        ) : document?.processingStatus === "failed" ? (
          <div className="p-8 text-center">
            <p className="text-red-500">Failed to process document</p>
          </div>
        ) : (
          <SummaryTab documentId={documentId} />
        )}
      </div>
    </>
  );
}
