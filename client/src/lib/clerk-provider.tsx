import { ClerkProvider } from '@clerk/clerk-react';
import { ReactNode } from 'react';

interface ClerkProviderWrapperProps {
  children: ReactNode;
}

export default function ClerkProviderWrapper({ children }: ClerkProviderWrapperProps) {
  // For debugging - directly check what environment variables we're getting
  console.log('Environment variables check:', {
    vite: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
    next: import.meta.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    all: import.meta.env
  });
  
  // Hardcode the publishable key for now since environment variables might not be loading properly
  const clerkPubKey = "pk_test_c2ltcGxlLW1hbGFtdXRlLTczLmNsZXJrLmFjY291bnRzLmRldiQ";
  
  // Original code trying to get env vars
  // const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || 
  //                   import.meta.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  
  if (!clerkPubKey) {
    console.error('Missing Clerk publishable key');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-4 rounded-md bg-red-50 border border-red-200">
          <h1 className="text-xl font-bold text-red-700 mb-2">Configuration Error</h1>
          <p className="text-red-600">
            Missing Clerk publishable key. Check your environment variables.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      {children}
    </ClerkProvider>
  );
}