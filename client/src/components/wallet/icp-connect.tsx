import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from '@/lib/queryClient';
import { AuthClient } from "@dfinity/auth-client";
import { Identity } from "@dfinity/agent";

export function ICPWalletConnect() {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [principal, setPrincipal] = useState<string | null>(null);
  const [authClient, setAuthClient] = useState<AuthClient | null>(null);
  const { toast } = useToast();
  const [_, setLocation] = useLocation();

  // Initialize the auth client and check login status
  useEffect(() => {
    const initAuthClient = async () => {
      try {
        // Create a new AuthClient
        const client = await AuthClient.create();
        setAuthClient(client);
        
        // Check if the user is already authenticated with Internet Identity
        const isAuthenticated = await client.isAuthenticated();
        
        if (isAuthenticated) {
          const identity = client.getIdentity();
          const principal = identity.getPrincipal().toString();
          setPrincipal(principal);
          setIsConnected(true);
        } else {
          // Check if we have a stored principal from a previous session
          const savedPrincipal = localStorage.getItem('icp_principal');
          if (savedPrincipal) {
            setPrincipal(savedPrincipal);
            setIsConnected(true);
          }
        }
      } catch (error) {
        console.error("Error initializing ICP AuthClient:", error);
      }
    };
    
    // Also check if connected with Plug wallet
    const checkPlugConnection = async () => {
      try {
        if (window.ic?.plug) {
          const connected = await window.ic.plug.isConnected();
          if (connected) {
            const principal = await window.ic.plug.getPrincipal();
            setPrincipal(principal.toString());
            setIsConnected(true);
          }
        }
      } catch (error) {
        console.error("Error checking Plug connection:", error);
      }
    };

    initAuthClient();
    checkPlugConnection();
  }, []);

  const shortenPrincipal = (principal: string) => {
    if (!principal) return '';
    return `${principal.slice(0, 6)}...${principal.slice(-4)}`;
  };

  const logout = async () => {
    setIsLoading(true);
    
    try {
      // Handle Plug wallet logout
      if (window.ic?.plug) {
        try {
          const isPlugConnected = await window.ic.plug.isConnected();
          if (isPlugConnected) {
            await window.ic.plug.disconnect();
          }
        } catch (plugError) {
          console.error("Error disconnecting from Plug:", plugError);
        }
      }
      
      // Handle Internet Identity logout
      if (authClient) {
        // Log out of Internet Identity if we have an auth client
        await authClient.logout();
      }
      
      setPrincipal(null);
      setIsConnected(false);

      // Remove from local storage
      localStorage.removeItem('icp_principal');

      // Clear user data from cache
      queryClient.setQueryData(["/api/user"], null);
      
      toast({
        title: "Logged Out",
        description: "Successfully disconnected from Internet Computer",
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
      <div className="flex items-center gap-2">
        <div className="font-mono text-sm">
          {shortenPrincipal(principal)}
        </div>
        <Button 
          variant="ghost" 
          onClick={logout}
          className="pixel-font text-sm"
          disabled={isLoading}
        >
          {isLoading ? "..." : "Disconnect"}
        </Button>
      </div>
    );
  }

  return null;
}