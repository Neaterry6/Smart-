import { useUser } from "@clerk/clerk-react";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";

// Flag to bypass authentication (for development only)
const BYPASS_AUTH = true;

export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  const { isSignedIn, isLoaded } = useUser();

  // If we're bypassing auth, just render the component
  if (BYPASS_AUTH) {
    return (
      <Route path={path}>
        <Component />
      </Route>
    );
  }

  if (!isLoaded) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-border" />
        </div>
      </Route>
    );
  }

  if (!isSignedIn) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  return (
    <Route path={path}>
      <Component />
    </Route>
  );
}