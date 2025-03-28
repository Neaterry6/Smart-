import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  Brain, Upload, Book, History, Plus, 
  CreditCard, MessageSquare, BarChart, Award
} from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import ClerkButtonGroup from "./ClerkButtonGroup";

export default function Header() {
  const [location] = useLocation();
  const { isSignedIn, isLoaded } = useUser();
  
  // Show no header when on auth page
  if (location === "/auth") {
    return null;
  }

  return (
    <header className="bg-gray-900 border-b border-gray-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/">
            <div className="flex items-center flex-shrink-0 text-purple-500 cursor-pointer">
              <Brain className="mr-2 h-6 w-6" />
              <span className="font-bold text-xl tracking-tight">StudyAI</span>
            </div>
          </Link>
          <div className="ml-10 hidden md:block">
            <div className="flex space-x-4">
              <Link href="/chat">
                <div className={`px-3 py-2 rounded-md text-sm font-medium cursor-pointer ${
                  location === "/chat" 
                    ? "text-purple-400 bg-gray-800" 
                    : "text-gray-300 hover:bg-gray-800 hover:text-purple-400"
                }`}>
                  <MessageSquare className="inline-block mr-1 h-4 w-4" />
                  <span>AI Chat</span>
                </div>
              </Link>
              
              {isSignedIn && (
                <>
                  <Link href="/dashboard">
                    <div className={`px-3 py-2 rounded-md text-sm font-medium cursor-pointer ${
                      location === "/dashboard" 
                        ? "text-purple-400 bg-gray-800" 
                        : "text-gray-300 hover:bg-gray-800 hover:text-purple-400"
                    }`}>
                      <BarChart className="inline-block mr-1 h-4 w-4" />
                      <span>Dashboard</span>
                    </div>
                  </Link>
                  <Link href="/upload">
                    <div className={`px-3 py-2 rounded-md text-sm font-medium cursor-pointer ${
                      location.includes("/document") 
                        ? "text-purple-400 bg-gray-800" 
                        : "text-gray-300 hover:bg-gray-800 hover:text-purple-400"
                    }`}>
                      <Book className="inline-block mr-1 h-4 w-4" />
                      <span>My Documents</span>
                    </div>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center">
          <Link href="/pricing">
            <Button variant="ghost" className="flex items-center text-gray-300 hover:text-purple-400 mr-3">
              <CreditCard className="mr-1 h-4 w-4" />
              <span>Pricing</span>
            </Button>
          </Link>
          
          {isSignedIn && (
            <Link href="/upload">
              <Button variant="secondary" className="flex items-center bg-purple-600 hover:bg-purple-700 text-white mr-4">
                <Plus className="mr-1 h-4 w-4" />
                <span>New Upload</span>
              </Button>
            </Link>
          )}

          <ClerkButtonGroup />
        </div>
      </div>
    </header>
  );
}