import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Document } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api";
import { Upload, FileText, Check } from "lucide-react";
import { useLocation } from "wouter";
import { formatDistanceToNow } from "date-fns";

interface UploadTabProps {
  onUploadComplete?: () => void;
}

export default function UploadTab({ onUploadComplete }: UploadTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [location, navigate] = useLocation();

  const { data: documents, isLoading } = useQuery<Document[]>({
    queryKey: ["/api/documents"],
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return apiRequest.post("/api/documents/upload", formData);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      toast({
        title: "Upload successful",
        description: "Your document is now being processed",
      });
      setIsUploading(false);
      if (onUploadComplete) onUploadComplete();
      navigate(`/flashcards/${data.id}`); // Navigate after successful upload
    },
    onError: (error) => {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
      setIsUploading(false);
    },
  });

  const handleFileUpload = async (file: File) => {
    if (!file || file.type !== "application/pdf") {
      toast({
        title: "Error",
        description: "Please select a PDF file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "File size must be less than 25MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    await uploadMutation.mutateAsync(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    await handleFileUpload(file);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleFileUpload(file);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };


  const navigateToDocument = (documentId: number) => {
    navigate(`/flashcards/${documentId}`);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Upload Documents</h2>
        <p className="text-gray-600">Upload PDF documents to generate study materials</p>
      </div>

      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center ${
          isDragging ? "border-primary-500 bg-primary-50" : "border-gray-300"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".pdf"
          className="hidden"
        />
        <div className="mx-auto mb-4">
          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        </div>
        <div className="text-gray-600">
          <Button
            onClick={handleBrowseClick}
            variant="outline"
            disabled={isUploading}
            className="mb-2"
          >
            {isUploading ? "Uploading..." : "Choose PDF file"}
          </Button>
          <p className="text-sm">or drag and drop</p>
          <p className="text-xs mt-2">PDF files up to 25MB</p>
        </div>
      </div>

      {documents && documents.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Your Documents</h3>
          <ul className="divide-y divide-gray-200 border-t border-b border-gray-200">
            {documents.map((doc) => (
              <li
                key={doc.id}
                className="py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                onClick={() => navigateToDocument(doc.id)}
              >
                <div className="flex items-center">
                  <FileText className="text-gray-400 h-5 w-5 mr-3" />
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{doc.originalName}</h4>
                    <p className="text-sm text-gray-500">
                      Uploaded {formatDistanceToNow(new Date(doc.uploadDate), { addSuffix: true })} • {formatBytes(doc.fileSize)}
                    </p>
                  </div>
                </div>
                <div>
                  {doc.processingStatus === "completed" ? (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Processed
                    </span>
                  ) : doc.processingStatus === "processing" ? (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      Processing
                    </span>
                  ) : (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                      Failed
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}