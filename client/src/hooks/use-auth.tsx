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
    refetch: refetchUser
  } = useQuery<SelectUser | null>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!address,
    retry: false,
    staleTime: 30000 // Cache for 30 seconds
  });

  // Import the device fingerprinting utility
  import { getOrCreateDeviceFingerprint } from "../lib/device-fingerprint";

  // Create/update user when wallet is connected
  useEffect(() => {
    let mounted = true;

    const createUser = async () => {
      if (!address || user || isLoading) return;

      try {
        // Get or create device ID
        let deviceId = localStorage.getItem('device_id');
        if (!deviceId) {
          deviceId = generateDeviceFingerprint();
          localStorage.setItem('device_id', deviceId);
        }

        // Send wallet address and device ID to create/retrieve user
        const res = await apiRequest("POST", "/api/user", { 
          walletAddress: address,
          walletType: 'eth', // Default wallet type for non-ICP wallets
          deviceId: deviceId
        });
        
        if (!res.ok) throw new Error("Failed to create user");

        const newUser = await res.json();
        if (mounted) {
          queryClient.setQueryData(["/api/user"], newUser);
          await refetchUser();
        }
      } catch (error) {
        console.error("Error creating user:", error);
        if (mounted) {
          toast({
            title: "Error",
            description: "Failed to create user profile. Please try again.",
            variant: "destructive",
          });
        }
      }
    };

    createUser();

    return () => {
      mounted = false;
    };
  }, [address, user, isLoading, toast, refetchUser]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: { username?: string; avatar?: string }) => {
      const res = await apiRequest("PATCH", "/api/user/profile", data);
      if (!res.ok) throw new Error("Failed to update profile");
      return await res.json();
    },
    onSuccess: (updatedUser: SelectUser) => {
      queryClient.setQueryData(["/api/user"], updatedUser);
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
      queryClient.setQueryData(["/api/user"], null);
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