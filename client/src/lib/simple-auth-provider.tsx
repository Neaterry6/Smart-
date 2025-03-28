import { createContext, useState, useContext, ReactNode } from 'react';

interface AuthContextType {
  isSignedIn: boolean;
  isLoaded: boolean;
  user: {
    id: number;
    name: string;
    email: string;
  } | null;
  signIn: () => void;
  signOut: () => void;
}

// Create auth context
const AuthContext = createContext<AuthContextType | null>(null);

// Auth provider component
export function SimpleAuthProvider({ children }: { children: ReactNode }) {
  const [isSignedIn, setIsSignedIn] = useState(true); // Default to signed in in bypass mode
  const [isLoaded, setIsLoaded] = useState(true); // Default to loaded

  // Simulated user
  const user = isSignedIn ? {
    id: 1,
    name: 'Test User',
    email: 'test@example.com'
  } : null;

  // Sign in function
  const signIn = () => {
    setIsSignedIn(true);
  };

  // Sign out function
  const signOut = () => {
    setIsSignedIn(false);
  };

  return (
    <AuthContext.Provider value={{ isSignedIn, isLoaded, user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook for accessing the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an SimpleAuthProvider');
  }
  return context;
}

// Compatible hooks with Clerk's API
export function useUser() {
  const { isSignedIn, isLoaded, user } = useAuth();
  return { isSignedIn, isLoaded, user };
}

export function useSignIn() {
  const { signIn } = useAuth();
  return { signIn };
}

export function useSignOut() {
  const { signOut } = useAuth();
  return { signOut };
}