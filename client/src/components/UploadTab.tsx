import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { Document } from "@shared/schema";
import { Upload, FileText, Check } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export default function UploadTab() {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const { data: documents, isLoading } = useQuery<Document[]>({
    queryKey: ["/api/documents"],
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return apiRequest.post("/api/documents/upload", formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      toast({
        title: "Success",
        description: "Document uploaded successfully",
      });
      setIsUploading(false);
    },
    onError: (error) => {
      console.error("Upload error:", error);
      toast({
        title: "Error",
        description: "Failed to upload document",
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

  const navigateToDocument = (id: number) => {
    navigate(`/documents/${id}`);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const response = await apiRequest("POST", "/api/documents/upload", null, formData);
      return await response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      toast({
        title: "Upload successful",
        description: "Your document is now being processed",
      });
      setIsUploading(false);
      // Navigate to the processing state with the new document
      navigate(`/flashcards/${data.id}`);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      uploadFile(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      uploadFile(files[0]);
    }
  };

  const uploadFile = (file: File) => {
    // Check if file is a PDF
    if (file.type !== "application/pdf") {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file",
        variant: "destructive",
      });
      return;
    }

    // Check file size (25MB limit)
    const maxSize = 25 * 1024 * 1024; // 25MB in bytes
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Maximum file size is 25MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    uploadMutation.mutate(file);
  };

  // Helper function to format bytes
  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const navigateToDocument = (documentId: number) => {
    navigate(`/flashcards/${documentId}`);
  };

  return (
    <div className="p-8">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Upload Your Study Material</h2>
        <p className="text-gray-600 mb-8">Upload your PDF documents and our AI will convert them into study materials</p>
      </div>

      <div className="max-w-3xl mx-auto">
        <div
          className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer hover:bg-gray-50 ${
            isDragging ? "border-primary-500 bg-primary-50" : "border-gray-300"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleBrowseClick}
        >
          {isUploading ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
              <p className="text-gray-600 mb-2">Uploading your file...</p>
            </div>
          ) : (
            <>
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">Drag and drop your PDF here</p>
              <p className="text-gray-500 text-sm mb-4">or</p>
              <Button onClick={handleBrowseClick}>
                Browse Files
              </Button>
              <p className="mt-2 text-xs text-gray-500">Maximum file size: 25MB</p>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".pdf"
                onChange={handleFileChange}
              />
            </>
          )}
        </div>

        <div className="mt-10">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Uploads</h3>
          
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading documents...</p>
            </div>
          ) : documents && documents.length > 0 ? (
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
          ) : (
            <div className="text-center py-8 border border-gray-200 rounded-md">
              <p className="text-gray-500">No documents uploaded yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
