import { createContext, useContext, useState, ReactNode } from "react";
import { api } from "@/lib/api";

export interface CustomerUser {
  id: string;
  email: string;
  name: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

interface UserContextType {
  user: CustomerUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (profile: Partial<CustomerUser>) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CustomerUser | null>(() => {
    const stored = localStorage.getItem("craft_customer_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [isLoading, setIsLoading] = useState(false);

  const saveUser = (newUser: CustomerUser) => {
    setUser(newUser);
    localStorage.setItem("craft_customer_user", JSON.stringify(newUser));
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const result = await api.auth.login(email, password);
      const currentUser: CustomerUser = {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        phone: result.user.phone,
        address: result.user.address,
      };
      saveUser(currentUser);
      localStorage.setItem("craft_customer_token", result.token);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const result = await api.auth.register(name, email, password, "customer");
      const currentUser: CustomerUser = {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        phone: result.user.phone,
        address: result.user.address,
      };
      saveUser(currentUser);
      localStorage.setItem("craft_customer_token", result.token);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("craft_customer_user");
    localStorage.removeItem("craft_customer_token");
  };

  const updateProfile = async (profile: Partial<CustomerUser>) => {
    setIsLoading(true);
    try {
      if (!user) return;
      const token = localStorage.getItem("craft_customer_token");
      if (!token) throw new Error("Please login again.");
      const updated = await api.users.updateProfile(user.id, { ...user, ...profile }, token);
      saveUser({
        id: updated.id,
        email: updated.email,
        name: updated.name,
        phone: updated.phone,
        address: updated.address,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
