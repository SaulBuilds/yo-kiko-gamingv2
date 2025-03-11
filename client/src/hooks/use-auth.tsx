import { createContext, ReactNode, useContext, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { User as SelectUser } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type AuthContextType = {
  user: SelectUser | null;
  isLoading: boolean;
  error: Error | null;
  address: string | undefined;
  updateProfileMutation: any;
  isConnecting: boolean;
  connect: () => void;
  disconnect: () => void;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const { address, isConnecting } = useAccount();
  const { connectAsync, connectors } = useConnect();
  const { disconnectAsync } = useDisconnect();

  const {
    data: user,
    error,
    isLoading,
    refetch,
  } = useQuery<SelectUser | null>({
    queryKey: ["/api/user", address],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!address,
  });

  // Create/update user when wallet is connected
  useEffect(() => {
    if (address && !user && !isLoading) {
      console.log("Creating user for wallet:", address);
      apiRequest("POST", "/api/user", { walletAddress: address })
        .then((res) => {
          if (!res.ok) {
            throw new Error("Failed to create user");
          }
          return res.json();
        })
        .then((newUser) => {
          console.log("User created:", newUser);
          queryClient.setQueryData(["/api/user", address], newUser);
          refetch();
        })
        .catch((error) => {
          console.error("Error creating user:", error);
          toast({
            title: "Error",
            description: "Failed to create user profile",
            variant: "destructive",
          });
        });
    }
  }, [address, user, isLoading, toast, refetch]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: { username?: string; avatar?: string }) => {
      const res = await apiRequest("PATCH", "/api/user/profile", data);
      if (!res.ok) {
        throw new Error("Failed to update profile");
      }
      return await res.json();
    },
    onSuccess: (updatedUser: SelectUser) => {
      queryClient.setQueryData(["/api/user", address], updatedUser);
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const connect = async () => {
    try {
      await connectAsync({ connector: connectors[0] });
    } catch (error) {
      toast({
        title: "Connection failed",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  const disconnect = async () => {
    try {
      await disconnectAsync();
      queryClient.setQueryData(["/api/user", address], null);
    } catch (error) {
      toast({
        title: "Disconnect failed",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        address,
        updateProfileMutation,
        isConnecting,
        connect,
        disconnect,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}