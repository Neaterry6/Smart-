import { useEffect } from "react";
import { useLocation } from "wouter";
import { useUser, useSignIn } from "@/lib/simple-auth-provider";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogIn, UserPlus } from "lucide-react";

export default function AuthPage() {
  const [location, navigate] = useLocation();
  const { isSignedIn, isLoaded } = useUser();
  const { signIn } = useSignIn();
  const searchParams = new URLSearchParams(location.split('?')[1] || '');
  const mode = searchParams.get('mode') === 'signUp' ? 'signUp' : 'signIn';
  
  useEffect(() => {
    // If user is already logged in, redirect to upload page
    if (isLoaded && isSignedIn) {
      navigate("/upload");
    }
  }, [isSignedIn, isLoaded, navigate]);

  // Show loading spinner while checking auth status
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  // Simple sign in handler
  const handleSignIn = () => {
    signIn();
    navigate("/upload");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-6xl mx-auto grid md:grid-cols-2 gap-8 items-center">
        {/* Hero Section */}
        <div className="order-2 md:order-1 text-white">
          <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
            StudyAI Companion
          </h1>
          <p className="text-xl mb-6 text-gray-300">
            Transform your study materials into interactive learning tools with AI
          </p>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 rounded-full bg-purple-500/10 p-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-500"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="7.5 4.21 12 6.81 16.5 4.21"></polyline><polyline points="7.5 19.79 7.5 14.6 3 12"></polyline><polyline points="21 12 16.5 14.6 16.5 19.79"></polyline><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-white">Instant Flashcards</h3>
                <p className="mt-1 text-gray-400">Create study flashcards from your PDF documents in seconds</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 rounded-full bg-pink-500/10 p-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-pink-500"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-white">Smart Quizzes</h3>
                <p className="mt-1 text-gray-400">Test your knowledge with AI-generated quizzes customized to your materials</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 rounded-full bg-indigo-500/10 p-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-white">Comprehensive Summaries</h3>
                <p className="mt-1 text-gray-400">Get concise summaries and key concepts extracted from your documents</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Auth Form */}
        <div className="order-1 md:order-2">
          <Card className="bg-gray-800 border-gray-700 text-white">
            <CardHeader>
              <CardTitle className="text-2xl text-center">
                {mode === 'signUp' ? 'Create an Account' : 'Sign In to Your Account'}
              </CardTitle>
              <CardDescription className="text-center text-gray-400">
                {mode === 'signUp' 
                  ? 'Join StudyAI and supercharge your learning' 
                  : 'Welcome back to StudyAI Companion'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-center text-gray-400 py-4">
                Click the button below to access the application in development mode.
                No actual authentication is needed in this simplified version.
              </p>
              
              <Button 
                className="w-full bg-purple-600 hover:bg-purple-700" 
                onClick={handleSignIn}
              >
                {mode === 'signUp' 
                  ? <><UserPlus className="mr-2 h-4 w-4" /> Create Account</>
                  : <><LogIn className="mr-2 h-4 w-4" /> Sign In</>
                }
              </Button>
            </CardContent>
            <CardFooter className="flex justify-center">
              <p className="text-sm text-gray-400">
                {mode === 'signUp' 
                  ? 'Already have an account?' 
                  : "Don't have an account?"
                } <a 
                    href={mode === 'signUp' ? '/auth' : '/auth?mode=signUp'} 
                    className="text-purple-400 hover:underline"
                  >
                    {mode === 'signUp' ? 'Sign In' : 'Sign Up'}
                  </a>
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}