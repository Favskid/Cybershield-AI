import React, { createContext, useContext, useEffect, useState } from "react";
import { useGetMe, getGetMeQueryKey, type User } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("cybershield_token");
  });
  
  const queryClient = useQueryClient();

  const { data: user, isLoading: isUserLoading } = useGetMe({
    query: {
      enabled: !!token,
      queryKey: getGetMeQueryKey()
    }
  });

  const login = (newToken: string) => {
    localStorage.setItem("cybershield_token", newToken);
    setToken(newToken);
    queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
  };

  const logout = () => {
    localStorage.removeItem("cybershield_token");
    setToken(null);
    queryClient.setQueryData(getGetMeQueryKey(), null);
    queryClient.clear();
  };

  return (
    <AuthContext.Provider value={{ user: user || null, token, login, logout, isLoading: isUserLoading && !!token }}>
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
