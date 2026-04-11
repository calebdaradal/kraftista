import { createContext, useContext, useState, ReactNode } from "react";

export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "editor";
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    // Load user from localStorage on mount
    const stored = localStorage.getItem("craft_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Mock authentication - replace with real API call
      await new Promise((resolve) => setTimeout(resolve, 800));

      if (email && password.length >= 6) {
        const mockUser: User = {
          id: "1",
          email,
          name: email.split("@")[0],
          role: "admin",
        };
        setUser(mockUser);
        localStorage.setItem("craft_user", JSON.stringify(mockUser));
      } else {
        throw new Error("Invalid credentials");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      // Mock registration - replace with real API call
      await new Promise((resolve) => setTimeout(resolve, 800));

      if (email && password.length >= 6 && name) {
        const mockUser: User = {
          id: Math.random().toString(),
          email,
          name,
          role: "editor",
        };
        setUser(mockUser);
        localStorage.setItem("craft_user", JSON.stringify(mockUser));
      } else {
        throw new Error("Invalid registration data");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setIsLoading(true);
    try {
      // Mock password reset - replace with real API call
      await new Promise((resolve) => setTimeout(resolve, 800));
      if (!email) throw new Error("Email is required");
      // In real app, send reset email
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("craft_user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
