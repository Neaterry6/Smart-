import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { SiGoogle } from "react-icons/si";
import { useLocation } from "wouter";

export default function ClerkButtonGroup() {
  const { isSignedIn, user } = useUser();
  const [, navigate] = useLocation();

  if (isSignedIn) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-white hidden md:inline">
          {user.firstName || user.emailAddresses[0]?.emailAddress?.split('@')[0] || 'User'}
        </span>
        <UserButton 
          afterSignOutUrl="/auth"
          appearance={{
            elements: {
              avatarBox: "w-8 h-8",
              userButtonBox: "hover:opacity-80 transition-opacity"
            }
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <SignInButton mode="modal">
        <Button variant="outline" size="sm" className="text-white border-gray-700 hover:bg-gray-800">
          Sign In
        </Button>
      </SignInButton>
      <SignUpButton mode="modal">
        <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">
          Sign Up
        </Button>
      </SignUpButton>
    </div>
  );
}