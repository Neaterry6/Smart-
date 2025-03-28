import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  Brain, Upload, Book, History, Plus, 
  CreditCard, MessageSquare, BarChart, Award,
  LogIn, LogOut, Music
} from "lucide-react";
import { useUser, useSignIn, useSignOut } from "@/lib/simple-auth-provider";

export default function Header() {
  const [location] = useLocation();
  const { isSignedIn, isLoaded } = useUser();
  const { signIn } = useSignIn();
  const { signOut } = useSignOut();
  
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
              
              <Link href="/music">
                <div className={`px-3 py-2 rounded-md text-sm font-medium cursor-pointer ${
                  location === "/music" 
                    ? "text-purple-400 bg-gray-800" 
                    : "text-gray-300 hover:bg-gray-800 hover:text-purple-400"
                }`}>
                  <Music className="inline-block mr-1 h-4 w-4" />
                  <span>Study Music</span>
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
          <Button 
            variant="ghost" 
            className="flex items-center text-gray-300 hover:text-purple-400 mr-3"
            onClick={() => window.location.href = "/pricing"}
          >
            <CreditCard className="mr-1 h-4 w-4" />
            <span>Pricing</span>
          </Button>
          
          {isSignedIn && (
            <Button 
              variant="secondary" 
              className="flex items-center bg-purple-600 hover:bg-purple-700 text-white mr-4"
              onClick={() => window.location.href = "/upload"}
            >
              <Plus className="mr-1 h-4 w-4" />
              <span>New Upload</span>
            </Button>
          )}

          {/* Auth buttons */}
          {isSignedIn ? (
            <Button 
              variant="outline" 
              className="flex items-center text-white"
              onClick={() => signOut()}
            >
              <LogOut className="mr-1 h-4 w-4" />
              <span>Sign Out</span>
            </Button>
          ) : (
            <Button 
              variant="outline" 
              className="flex items-center text-white"
              onClick={() => signIn()}
            >
              <LogIn className="mr-1 h-4 w-4" />
              <span>Sign In</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}