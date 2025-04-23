import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from '@/lib/queryClient';

export function ICPWalletConnect() {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [principal, setPrincipal] = useState<string | null>(null);
  const { toast } = useToast();
  const [_, setLocation] = useLocation();

  // Check if the user is logged in via ICP (using localStorage)
  useEffect(() => {
    const savedPrincipal = localStorage.getItem('icp_principal');
    if (savedPrincipal) {
      setPrincipal(savedPrincipal);
      setIsConnected(true);
    }
  }, []);

  const shortenPrincipal = (principal: string) => {
    if (!principal) return '';
    return `${principal.slice(0, 6)}...${principal.slice(-4)}`;
  };

  const logout = async () => {
    setIsLoading(true);
    
    try {
      // Clear state
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