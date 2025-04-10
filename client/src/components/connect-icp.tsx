import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from '@/lib/queryClient';

// Mock implementation for ICP authentication
// In a real implementation, this would connect to Internet Identity
export function ConnectICP() {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [principal, setPrincipal] = useState<string | null>(null);
  const { toast } = useToast();
  const [_, setLocation] = useLocation();

  const shortenPrincipal = (principal: string) => {
    if (!principal) return '';
    return `${principal.slice(0, 6)}...${principal.slice(-4)}`;
  };

  const login = async () => {
    setIsLoading(true);
    
    try {
      // Mock implementation - In production you would:
      // 1. Create an AuthClient
      // 2. Call authClient.login() with the Internet Identity URL
      // 3. Update the principal from authClient.getIdentity().getPrincipal()
      console.log("Starting NFID login from auth page...");
      console.log("Initiating NFID connection...");
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock successful login
      const mockPrincipal = "5uylz-j7fcd-isj73-gp57f-xwwyy-po2ib-7iboa-fdkdv-nrsam-3bd3r-qqe";
      setPrincipal(mockPrincipal);
      setIsConnected(true);
      
      // Store in localStorage for persistence
      localStorage.setItem('icp_principal', mockPrincipal);
      
      // Create a mock user for ICP login
      await createUserForICP(mockPrincipal);
      
      toast({
        title: "Success!",
        description: "Connected to Internet Identity",
      });

      // Redirect to dashboard
      setLocation("/dashboard");
    } catch (error) {
      console.error("ICP login error:", error);
      toast({
        title: "Connection Failed",
        description: "Could not connect to Internet Identity. Please try again.",
        variant: "destructive",
      });
    } finally {
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
      // Mock logout - In production you would:
      // Call authClient.logout()
      console.log("Logging out from ICP...");
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setPrincipal(null);
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