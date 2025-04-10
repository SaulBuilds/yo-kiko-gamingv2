import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from '@/lib/queryClient';
import { AuthClient } from "@dfinity/auth-client";
import { Identity } from "@dfinity/agent";

export function ConnectICP() {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [principal, setPrincipal] = useState<string | null>(null);
  const [authClient, setAuthClient] = useState<AuthClient | null>(null);
  const [identity, setIdentity] = useState<Identity | null>(null);
  const { toast } = useToast();
  const [_, setLocation] = useLocation();

  // Initialize the auth client
  useEffect(() => {
    const init = async () => {
      try {
        // Create a new AuthClient
        const client = await AuthClient.create();
        setAuthClient(client);
        
        // Check if the user is already authenticated
        const isAuthenticated = await client.isAuthenticated();
        
        if (isAuthenticated) {
          const identity = client.getIdentity();
          const principal = identity.getPrincipal().toString();
          
          setIdentity(identity);
          setPrincipal(principal);
          setIsConnected(true);
          
          // Save to localStorage for persistence between page reloads
          localStorage.setItem('icp_principal', principal);
          
          // Create or update user
          try {
            await createUserForICP(principal);
          } catch (err) {
            console.error("Failed to sync authenticated user:", err);
          }
        }
      } catch (error) {
        console.error("Error initializing ICP AuthClient:", error);
      }
    };
    
    init();
  }, []);

  const shortenPrincipal = (principal: string) => {
    if (!principal) return '';
    return `${principal.slice(0, 6)}...${principal.slice(-4)}`;
  };

  const login = async () => {
    setIsLoading(true);
    
    try {
      if (!authClient) {
        throw new Error("Auth client not initialized");
      }
      
      console.log("Starting Internet Identity login...");

      // Set up the callback config for Internet Identity
      // The production host for Internet Identity is https://identity.ic0.app
      await authClient.login({
        identityProvider: "https://identity.ic0.app",
        onSuccess: async () => {
          // Get the identity after successful authentication
          const identity = authClient.getIdentity();
          const principal = identity.getPrincipal().toString();
          
          setIdentity(identity);
          setPrincipal(principal);
          setIsConnected(true);
          
          // Store in localStorage for persistence
          localStorage.setItem('icp_principal', principal);
          
          // Create a user for ICP login
          await createUserForICP(principal);
          
          toast({
            title: "Success!",
            description: "Connected to Internet Identity",
          });
          
          // Redirect to dashboard
          setLocation("/dashboard");
          setIsLoading(false);
        },
        onError: (error) => {
          console.error("ICP login error:", error);
          toast({
            title: "Connection Failed",
            description: "Could not connect to Internet Identity. Please try again.",
            variant: "destructive",
          });
          setIsLoading(false);
        }
      });
    } catch (error) {
      console.error("ICP login error:", error);
      toast({
        title: "Connection Failed",
        description: "Could not connect to Internet Identity. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const createUserForICP = async (principal: string) => {
    try {
      // Call the API to create a user with the ICP principal
      const res = await fetch("/api/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          walletAddress: principal,
          walletType: "icp" 
        }),
      });
      
      if (!res.ok) throw new Error("Failed to create user");
      
      const userData = await res.json();
      // Update the cache with the new user data
      queryClient.setQueryData(["/api/user"], userData);
    } catch (err) {
      console.error("Error creating user for ICP:", err);
      throw err;
    }
  };

  const logout = async () => {
    setIsLoading(true);
    
    try {
      if (!authClient) {
        throw new Error("Auth client not initialized");
      }
      
      console.log("Logging out from ICP...");
      
      // Log out of Internet Identity
      await authClient.logout();
      
      // Clear state
      setPrincipal(null);
      setIdentity(null);
      setIsConnected(false);
      
      // Remove from localStorage
      localStorage.removeItem('icp_principal');

      // Clear user data from cache
      queryClient.setQueryData(["/api/user"], null);
      
      toast({
        title: "Logged Out",
        description: "Successfully disconnected from Internet Identity",
      });

      // Redirect to home page
      setLocation("/");
    } catch (error) {
      console.error("ICP logout error:", error);
      toast({
        title: "Logout Failed",
        description: "Error during logout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isConnected && principal) {
    return (
      <Button 
        onClick={logout}
        className="pixel-font flex items-center gap-2 w-full"
        variant="outline"
        disabled={isLoading}
      >
        <Globe className="w-4 h-4" />
        {isLoading ? "Disconnecting..." : `Connected with ICP (${shortenPrincipal(principal)})`}
      </Button>
    );
  }

  return (
    <Button 
      onClick={login}
      className="pixel-font flex items-center gap-2 w-full"
      variant="secondary"
      disabled={isLoading}
    >
      <Globe className="w-4 h-4" />
      {isLoading ? "Connecting..." : "Connect with Internet Identity"}
    </Button>
  );
}