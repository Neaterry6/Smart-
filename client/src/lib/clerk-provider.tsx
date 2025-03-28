import { ClerkProvider } from '@clerk/clerk-react';
import { ReactNode } from 'react';
import { config } from './config';

interface ClerkProviderWrapperProps {
  children: ReactNode;
}

export default function ClerkProviderWrapper({ children }: ClerkProviderWrapperProps) {
  // Get Clerk publishable key from config file
  const clerkPubKey = config.clerk.publishableKey;
  
  if (!clerkPubKey) {
    console.error('Missing Clerk publishable key');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-4 rounded-md bg-red-50 border border-red-200">
          <h1 className="text-xl font-bold text-red-700 mb-2">Configuration Error</h1>
          <p className="text-red-600">
            Missing Clerk publishable key. Please check application configuration.
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