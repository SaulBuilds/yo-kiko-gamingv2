import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from "@/components/ui/button";
import { Globe, Wallet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLoginWithAbstract } from "@abstract-foundation/agw-react";

export function ConnectCombined() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [_, setLocation] = useLocation();
  const { login: loginWithAbstract } = useLoginWithAbstract();

  const handleCombinedLogin = async () => {
    setIsLoading(true);
    
    try {
      console.log("Starting combined login flow...");
      
      // First: Internet Identity login (mocked for now)
      // In a real implementation, we would integrate with Internet Identity here
      console.log("Starting ICP authentication...");
      
      // Simulate ICP login
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock principal for demonstration
      const mockPrincipal = "5uylz-j7fcd-isj73-gp57f-xwwyy-po2ib-7iboa-fdkdv-nrsam-3bd3r-qqe";
      localStorage.setItem('icp_principal', mockPrincipal);
      
      // Create a mock user for ICP
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
        title: "Step 1 Complete",
        description: "Internet Identity authenticated! Connecting with Abstract wallet...",
      });

      // Second: Abstract login 
      console.log("Starting Abstract login...");
      
      // Trigger Abstract login - this will open the Abstract modal
      loginWithAbstract();
      
      // No need to handle redirects as Abstract will handle that
      
    } catch (error) {
      console.error("Combined login error:", error);
      toast({
        title: "Connection Failed",
        description: "Could not complete the authentication process. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleCombinedLogin}
      className="pixel-font flex items-center gap-2 w-full"
      variant="default"
      disabled={isLoading}
    >
      <div className="flex items-center gap-1">
        <Globe className="w-4 h-4" />
        <Wallet className="w-4 h-4" />
      </div>
      {isLoading ? "Connecting..." : "Connect with Abstract via Internet Identity"}
    </Button>
  );
}