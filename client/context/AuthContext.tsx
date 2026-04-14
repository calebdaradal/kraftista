import { createContext, useContext, useState, ReactNode } from "react";
import { api } from "@/lib/api";

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
    const stored = localStorage.getItem("craft_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const result = await api.auth.login(email, password);
      const authUser: User = {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        role: result.user.role === "customer" ? "editor" : result.user.role,
      };
      setUser(authUser);
      localStorage.setItem("craft_user", JSON.stringify(authUser));
      localStorage.setItem("craft_auth_token", result.token);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const result = await api.auth.register(name, email, password, "editor");
      const authUser: User = {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        role: result.user.role === "customer" ? "editor" : result.user.role,
      };
      setUser(authUser);
      localStorage.setItem("craft_user", JSON.stringify(authUser));
      localStorage.setItem("craft_auth_token", result.token);
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setIsLoading(true);
    try {
      if (!email) throw new Error("Email is required");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("craft_user");
    localStorage.removeItem("craft_auth_token");
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
