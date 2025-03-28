import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  Brain, LogOut, User, Upload, Book, History, Plus, 
  CreditCard, MessageSquare, BarChart, Award
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  
  // Show no header when on auth page
  if (location === "/auth") {
    return null;
  }

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (!user || !user.name) return user?.username?.charAt(0).toUpperCase() || "U";
    return user.name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase();
  };

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
              
              {user && (
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
                      location.includes("/documents") 
                        ? "text-purple-400 bg-gray-800" 
                        : "text-gray-300 hover:bg-gray-800 hover:text-purple-400"
                    }`}>
                      <Book className="inline-block mr-1 h-4 w-4" />
                      <span>My Documents</span>
                    </div>
                  </Link>
                  <Link href="/upload">
                    <div className={`px-3 py-2 rounded-md text-sm font-medium cursor-pointer ${
                      location.includes("/history") 
                        ? "text-purple-400 bg-gray-800" 
                        : "text-gray-300 hover:bg-gray-800 hover:text-purple-400"
                    }`}>
                      <History className="inline-block mr-1 h-4 w-4" />
                      <span>Study History</span>
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
          
          {user ? (
            <>
              <Link href="/upload">
                <Button variant="secondary" className="flex items-center bg-purple-600 hover:bg-purple-700 text-white">
                  <Plus className="mr-1 h-4 w-4" />
                  <span>New Upload</span>
                </Button>
              </Link>
              <div className="ml-4 relative flex-shrink-0">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="h-8 w-8 cursor-pointer ring-2 ring-purple-500 hover:ring-purple-400 transition-all">
                      <AvatarImage src={user.image || undefined} alt={user.username || "User"} />
                      <AvatarFallback className="bg-purple-900 text-white">{getUserInitials()}</AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-gray-900 text-white border border-gray-800">
                    <DropdownMenuLabel>
                      <div className="font-bold">{user.name || user.username}</div>
                      {user.email && <div className="text-xs text-gray-400">{user.email}</div>}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-gray-800" />
                    <Link href="/dashboard">
                      <DropdownMenuItem className="hover:bg-gray-800 cursor-pointer">
                        <Award className="mr-2 h-4 w-4" />
                        <span>Learning Dashboard</span>
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuItem className="hover:bg-gray-800 cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="hover:bg-gray-800 text-red-400 hover:text-red-300 cursor-pointer"
                      onClick={() => logoutMutation.mutate()}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </>
          ) : (
            <Link href="/auth">
              <Button variant="default" className="bg-purple-600 hover:bg-purple-700 text-white">
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}