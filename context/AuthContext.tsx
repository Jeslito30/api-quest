/**
 * AuthContext — powered by Clerk
 *
 * Wraps Clerk's useUser / useAuth so the rest of the app
 * can keep calling `useAuth()` exactly as before.
 *
 * Exposed values:
 *   user        – Clerk User object (or null)
 *   userId      – clerk user.id string (used as FK in Supabase)
 *   loading     – true while Clerk is initialising
 *   signOut()   – signs the user out via Clerk
 */
import React, { createContext, useContext, ReactNode } from 'react';
import { useUser, useAuth as useClerkAuth } from '@clerk/clerk-expo';

interface AuthContextType {
  user: any; // Using any for Clerk UserResource if types are not easily imported, but userId is extracted
  userId: string | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerkAuth();

  return (
    <AuthContext.Provider
      value={{
        user,
        userId: user?.id ?? null,
        loading: !isLoaded,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
