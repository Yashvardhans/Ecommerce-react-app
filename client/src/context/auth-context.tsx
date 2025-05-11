import { createContext, ReactNode, useState, useEffect, useCallback } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (userData: Partial<UpdateProfileData>) => Promise<boolean>;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

interface UpdateProfileData {
  username?: string;
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  phone?: string;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => false,
  register: async () => false,
  logout: async () => {},
  updateProfile: async () => false,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch current user data
  const { 
    data: user = null, 
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: ["/api/auth/me"],
    retry: false,
    refetchOnWindowFocus: false,
    onError: () => {}
  });
  
  const isAuthenticated = !!user && !isError;
  
  const login = async (username: string, password: string) => {
    try {
      await apiRequest("POST", "/api/auth/login", { username, password });
      await refetch();
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
      return true;
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Invalid credentials",
        variant: "destructive",
      });
      return false;
    }
  };
  
  const register = async (userData: RegisterData) => {
    try {
      await apiRequest("POST", "/api/auth/register", userData);
      await refetch();
      toast({
        title: "Registration successful",
        description: "Your account has been created",
      });
      return true;
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "Could not create account",
        variant: "destructive",
      });
      return false;
    }
  };
  
  const logout = async () => {
    try {
      await apiRequest("POST", "/api/auth/logout");
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Logout failed",
        description: "An error occurred while logging out",
        variant: "destructive",
      });
    }
  };
  
  const updateProfile = async (userData: Partial<UpdateProfileData>) => {
    try {
      await apiRequest("PUT", "/api/users/profile", userData);
      await refetch();
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
      return true;
    } catch (error) {
      console.error("Update profile error:", error);
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Could not update profile",
        variant: "destructive",
      });
      return false;
    }
  };
  
  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
