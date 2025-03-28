import { useUser, SignIn, SignUp, SignInButton } from "@clerk/clerk-react";
import { SiGoogle } from "react-icons/si";
import { Button } from "@/components/ui/button";

interface ClerkAuthProps {
  mode?: "signIn" | "signUp";
}

export default function ClerkAuth({ mode = "signIn" }: ClerkAuthProps) {
  const { isSignedIn, user } = useUser();

  if (isSignedIn) {
    return (
      <div className="p-4 bg-white rounded-lg shadow-md">
        <p className="mb-2">
          Signed in as {user.firstName} {user.lastName}
        </p>
        <Button variant="outline" onClick={() => window.location.href = "/"}>
          Go to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">
        {mode === "signIn" ? "Sign In with Clerk" : "Sign Up with Clerk"}
      </h2>
      
      <div className="mb-4">
        <SignInButton mode="modal">
          <Button className="w-full flex items-center justify-center gap-2">
            <SiGoogle className="h-4 w-4" />
            Continue with Google
          </Button>
        </SignInButton>
      </div>
      
      <div className="text-sm text-center text-gray-500">
        {mode === "signIn" ? (
          <p>Google authentication through Clerk provides secure sign-in.</p>
        ) : (
          <p>Create an account easily with your Google credentials.</p>
        )}
      </div>
    </div>
  );
}