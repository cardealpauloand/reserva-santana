import { createContext, useContext, useEffect, useState } from "react";
import { authService } from "@/services/auth";
import type { User, AuthSession } from "@/types/auth";

interface AuthContextType {
  user: User | null;
  session: AuthSession | null;
  isAdmin: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isAdmin: false,
  loading: true,
  signOut: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadUser = async () => {
    const token = authService.getToken();

    if (!token) {
      setUser(null);
      setSession(null);
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    try {
      const userData = await authService.getUser();
      setUser(userData);
      setSession({ access_token: token });
      setIsAdmin(userData.is_admin);
    } catch (error) {
      console.error('Error loading user:', error);
      // Clear invalid token
      authService.clearToken();
      setUser(null);
      setSession(null);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();

    // Listen for unauthorized events from API
    const handleUnauthorized = () => {
      setUser(null);
      setSession(null);
      setIsAdmin(false);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);

    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);

  const signOut = async () => {
    await authService.logout();
    setUser(null);
    setSession(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ user, session, isAdmin, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
