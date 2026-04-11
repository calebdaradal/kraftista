import { createContext, useContext, useState, ReactNode } from "react";

export interface CustomerUser {
  id: string;
  email: string;
  name: string;
  phone?: string;
  address?: string;
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
      await new Promise((resolve) => setTimeout(resolve, 600));

      if (email && password.length >= 6) {
        const mockUser: CustomerUser = {
          id: Math.random().toString(),
          email,
          name: email.split("@")[0],
        };
        saveUser(mockUser);
      } else {
        throw new Error("Invalid email or password");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));

      if (email && password.length >= 6 && name) {
        const mockUser: CustomerUser = {
          id: Math.random().toString(),
          email,
          name,
        };
        saveUser(mockUser);
      } else {
        throw new Error("Invalid registration data");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("craft_customer_user");
  };

  const updateProfile = async (profile: Partial<CustomerUser>) => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 400));

      if (user) {
        const updatedUser = { ...user, ...profile };
        saveUser(updatedUser);
      }
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
