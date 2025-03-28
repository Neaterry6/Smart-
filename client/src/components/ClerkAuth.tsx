import { useUser, SignIn, SignUp, SignInButton } from "@clerk/clerk-react";
import { SiGoogle } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { dark } from "@clerk/themes";
import { useLocation } from "wouter";

interface ClerkAuthProps {
  mode?: "signIn" | "signUp";
}

export default function ClerkAuth({ mode = "signIn" }: ClerkAuthProps) {
  const { isSignedIn, user } = useUser();
  const [, navigate] = useLocation();

  if (isSignedIn) {
    return (
      <div className="p-6 bg-gray-900 rounded-lg shadow-xl border border-gray-800 text-white">
        <div className="text-center mb-4">
          <div className="inline-block rounded-full bg-purple-600 p-2 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          </div>
          <h2 className="text-xl font-bold">Successfully Signed In</h2>
          <p className="text-gray-400 mt-1">
            Welcome back, {user.firstName || user.emailAddresses[0]?.emailAddress?.split('@')[0] || 'User'}
          </p>
        </div>
        <Button 
          className="w-full bg-purple-600 hover:bg-purple-700" 
          onClick={() => navigate("/upload")}
        >
          Go to Dashboard
        </Button>
      </div>
    );
  }

  // For a more seamless experience, we'll use Clerk's components directly
  if (mode === "signIn") {
    return (
      <SignIn 
        appearance={{
          baseTheme: dark,
          elements: {
            formButtonPrimary: 
              "bg-purple-600 hover:bg-purple-700 text-sm normal-case",
            footerActionLink: "text-purple-400 hover:text-purple-300",
            card: "bg-gray-900 border-gray-800",
            formField: "bg-gray-800",
            formFieldInput: "bg-gray-800 border-gray-700"
          }
        }}
        routing="path"
        path="/auth"
        signUpUrl="/auth?mode=signUp"
      />
    );
  }
  
  return (
    <SignUp 
      appearance={{
        baseTheme: dark,
        elements: {
          formButtonPrimary: 
            "bg-purple-600 hover:bg-purple-700 text-sm normal-case",
          footerActionLink: "text-purple-400 hover:text-purple-300",
          card: "bg-gray-900 border-gray-800",
          formField: "bg-gray-800",
          formFieldInput: "bg-gray-800 border-gray-700"
        }
      }}
      routing="path"
      path="/auth"
      signInUrl="/auth?mode=signIn"
    />
  );
}