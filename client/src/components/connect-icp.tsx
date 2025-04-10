import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock implementation for ICP authentication
// In a real implementation, this would connect to Internet Identity
export function ConnectICP() {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [principal, setPrincipal] = useState<string | null>(null);
  const { toast } = useToast();

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
      console.log("Starting ICP login...");
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock successful login
      const mockPrincipal = "5uylz-j7fcd-isj73-gp57f-xwwyy-po2ib-7iboa-fdkdv-nrsam-3bd3r-qqe";
      setPrincipal(mockPrincipal);
      setIsConnected(true);
      
      toast({
        title: "Success!",
        description: "Connected to Internet Identity",
      });
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
      
      toast({
        title: "Logged Out",
        description: "Successfully disconnected from Internet Identity",
      });
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