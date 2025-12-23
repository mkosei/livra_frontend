"use client";

// src/contexts/UserContext.tsx
import { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { jwtDecode } from "jwt-decode";


type User = {
  id: string;
  email: string;
  name: string;
  bio?: string;
  avatarUrl: string;
};

type UserContextType = {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  logout: () => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

type Props = { children: ReactNode };

export const UserProvider = ({ children }: Props) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // 起動時に localStorage から JWT を復元
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded: any = jwtDecode(token);
      setCurrentUser({ id: decoded.sub, email: decoded.email, name: decoded.name, bio: decoded.bio, avatarUrl: decoded.avatarUrl });
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    setCurrentUser(null);
  };

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser, logout }}>
      {children}
    </UserContext.Provider>
  );
};

// カスタムフックで使いやすく
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within UserProvider");
  return context;
};
