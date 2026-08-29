import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import {
  User as FirebaseUser,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  updateProfile,
} from 'firebase/auth';
import { auth, googleAuthProvider } from '../lib/firebase.ts';
import { UserProfile } from '../types.ts';

interface AuthContextType {
  user: FirebaseUser | null;
  dbUser: UserProfile | null;
  loading: boolean;
  token: string | null;
  signInWithGoogle: () => Promise<{ success: boolean; cancelled?: boolean }>;
  signInWithEmail: (email: string, pass: string) => Promise<{ success: boolean }>;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<{ success: boolean }>;
  signInAsGuest: (guestName?: string) => Promise<{ success: boolean }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  getAuthHeaders: () => Record<string, string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [dbUser, setDbUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync token and db profile
  const fetchDbProfile = async (currentToken: string) => {
    try {
      const res = await fetch('/api/me', {
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setDbUser(data.user);
      }
    } catch (err) {
      console.warn('Erro ao sincronizar perfil com o banco PostgreSQL:', err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const idToken = await firebaseUser.getIdToken();
          setToken(idToken);
          await fetchDbProfile(idToken);
        } catch (error) {
          console.warn('Error fetching token:', error);
        }
      } else {
        setToken(null);
        setDbUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async (): Promise<{ success: boolean; cancelled?: boolean }> => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, googleAuthProvider);
      const idToken = await result.user.getIdToken();
      setToken(idToken);
      await fetchDbProfile(idToken);
      return { success: true };
    } catch (error: any) {
      // Gracefully handle user-initiated popup closing without throwing red fatal errors
      if (
        error?.code === 'auth/popup-closed-by-user' ||
        error?.code === 'auth/cancelled-popup-request' ||
        error?.message?.includes('auth/popup-closed-by-user')
      ) {
        return { success: false, cancelled: true };
      }
      if (error?.code === 'auth/popup-blocked') {
        throw new Error('A janela pop-up foi bloqueada pelo seu navegador. Por favor habilite pop-ups para este site ou utilize o login direto por e-mail.');
      }
      console.warn('Google Sign In Notice:', error?.message || error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithEmail = async (email: string, pass: string): Promise<{ success: boolean }> => {
    try {
      setLoading(true);
      const res = await signInWithEmailAndPassword(auth, email, pass);
      const idToken = await res.user.getIdToken();
      setToken(idToken);
      await fetchDbProfile(idToken);
      return { success: true };
    } catch (error: any) {
      if (
        error?.code === 'auth/user-not-found' ||
        error?.code === 'auth/wrong-password' ||
        error?.code === 'auth/invalid-credential'
      ) {
        throw new Error('E-mail ou senha incorretos.');
      }
      if (error?.code === 'auth/invalid-email') {
        throw new Error('Formato de e-mail inválido.');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name: string): Promise<{ success: boolean }> => {
    try {
      setLoading(true);
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      if (name && res.user) {
        await updateProfile(res.user, { displayName: name });
      }
      const idToken = await res.user.getIdToken();
      setToken(idToken);
      await fetchDbProfile(idToken);
      return { success: true };
    } catch (error: any) {
      if (error?.code === 'auth/email-already-in-use') {
        // If already registered, attempt sign in
        return await signInWithEmail(email, pass);
      }
      if (error?.code === 'auth/weak-password') {
        throw new Error('A senha deve ter pelo menos 6 caracteres.');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInAsGuest = async (guestName?: string): Promise<{ success: boolean }> => {
    try {
      setLoading(true);
      const res = await signInAnonymously(auth);
      if (guestName && res.user) {
        await updateProfile(res.user, { displayName: guestName });
      }
      const idToken = await res.user.getIdToken();
      setToken(idToken);
      await fetchDbProfile(idToken);
      return { success: true };
    } catch (error: any) {
      console.warn('Guest sign in:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setToken(null);
      setDbUser(null);
    } catch (error) {
      console.error('Sign Out Error:', error);
    }
  };

  const refreshProfile = async () => {
    if (token) {
      await fetchDbProfile(token);
    }
  };

  const getAuthHeaders = () => {
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const value = useMemo(
    () => ({
      user,
      dbUser,
      loading,
      token,
      signInWithGoogle,
      signInWithEmail,
      signUpWithEmail,
      signInAsGuest,
      signOut,
      refreshProfile,
      getAuthHeaders,
    }),
    [user, dbUser, loading, token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
