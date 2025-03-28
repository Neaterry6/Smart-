import { SignInButton, SignUpButton } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { SiGoogle } from "react-icons/si";

export default function ClerkButtonGroup() {
  return (
    <div className="flex flex-col space-y-4 w-full max-w-xs mx-auto">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-700" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-gray-900 px-2 text-gray-400">Or sign in with</span>
        </div>
      </div>
      
      <SignInButton mode="modal">
        <Button variant="outline" className="w-full bg-gray-800 border-gray-700 hover:bg-gray-700">
          <SiGoogle className="h-4 w-4 mr-2" />
          Continue with Google
        </Button>
      </SignInButton>
      
      <p className="text-xs text-center text-gray-500">
        Secure authentication powered by Clerk
      </p>
    </div>
  );
}