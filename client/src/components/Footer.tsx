import { Link } from "wouter";
import { HelpCircle, Settings } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-12">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">© 2023 StudyAI. All rights reserved.</p>
          </div>
          <div className="flex space-x-6">
            <Link href="#" className="text-gray-400 hover:text-gray-500">
              <span className="sr-only">Help Center</span>
              <HelpCircle className="h-5 w-5" />
            </Link>
            <Link href="#" className="text-gray-400 hover:text-gray-500">
              <span className="sr-only">Settings</span>
              <Settings className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
