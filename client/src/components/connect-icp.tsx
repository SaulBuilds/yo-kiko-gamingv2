import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function ConnectICP() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [_, setLocation] = useLocation();

  const login = async () => {
    setIsLoading(true);
    
    try {
      console.log("Starting ICP login...");
      
      // In a real implementation, we would integrate with Internet Identity here
      // For now, mock the connection and redirect to dashboard
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock principal for demonstration
      const mockPrincipal = "5uylz-j7fcd-isj73-gp57f-xwwyy-po2ib-7iboa-fdkdv-nrsam-3bd3r-qqe";
      localStorage.setItem('icp_principal', mockPrincipal);
      
      // Create a mock user
      await fetch("/api/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          walletAddress: mockPrincipal,
          walletType: "icp" 
        }),
      });
      
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