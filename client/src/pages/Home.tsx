import { useEffect } from "react";
import { useLocation } from "wouter";
import { useUser } from "@clerk/clerk-react";
import { Loader2 } from "lucide-react";

// Flag to bypass authentication (for development only)
const BYPASS_AUTH = true;

export default function Home() {
  const [location, setLocation] = useLocation();
  const { isSignedIn, isLoaded } = useUser();

  useEffect(() => {
    if (BYPASS_AUTH) {
      // In bypass mode, always go to upload page
      setLocation("/upload");
      return;
    }

    if (isLoaded) {
      // If user is authenticated, redirect to upload page
      // Otherwise, redirect to auth page
      if (isSignedIn) {
        setLocation("/upload");
      } else {
        setLocation("/auth");
      }
    }
  }, [isSignedIn, isLoaded, setLocation]);

  // Show loading spinner while checking auth status
  if (!BYPASS_AUTH && !isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return null;
}
