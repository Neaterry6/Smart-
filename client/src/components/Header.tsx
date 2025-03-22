import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Brain } from "lucide-react";

export default function Header() {
  const [location] = useLocation();

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/">
            <div className="flex items-center flex-shrink-0 text-primary-600 cursor-pointer">
              <Brain className="mr-2 h-6 w-6" />
              <span className="font-bold text-xl tracking-tight">StudyAI</span>
            </div>
          </Link>
          <div className="ml-10 hidden md:block">
            <div className="flex space-x-4">
              <Link href="/upload">
                <a className={`px-3 py-2 rounded-md text-sm font-medium ${location === "/upload" ? "text-primary-600" : "text-gray-500 hover:bg-primary-50 hover:text-primary-600"}`}>
                  Dashboard
                </a>
              </Link>
              <Link href="/upload">
                <a className="px-3 py-2 rounded-md text-sm font-medium text-gray-500 hover:bg-primary-50 hover:text-primary-600">
                  My Documents
                </a>
              </Link>
              <Link href="/upload">
                <a className="px-3 py-2 rounded-md text-sm font-medium text-gray-500 hover:bg-primary-50 hover:text-primary-600">
                  Study History
                </a>
              </Link>
            </div>
          </div>
        </div>
        <div className="flex items-center">
          <Link href="/upload">
            <Button className="flex items-center">
              <span className="material-icons mr-1" style={{ fontSize: "18px" }}>add</span>
              New Project
            </Button>
          </Link>
          <div className="ml-4 relative flex-shrink-0">
            <div>
              <button className="bg-gray-100 rounded-full flex text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                <span className="sr-only">Open user menu</span>
                <img 
                  className="h-8 w-8 rounded-full" 
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
                  alt="User avatar"
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
