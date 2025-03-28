import { useEffect } from "react";
import { useLocation } from "wouter";
import { useUser } from "@clerk/clerk-react";
import { Loader2 } from "lucide-react";

export default function Home() {
  const [location, setLocation] = useLocation();
  const { isSignedIn, isLoaded } = useUser();

  useEffect(() => {
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
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return null;
}
