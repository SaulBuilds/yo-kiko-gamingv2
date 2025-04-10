import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from "@/components/ui/button";
import { Globe, Wallet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLoginWithAbstract } from "@abstract-foundation/agw-react";
import { Card, CardContent } from "@/components/ui/card";
import { Image } from "@/components/ui/image";

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
    <div className="space-y-6">
      <div className="flex gap-4 justify-center">
        <Image src="/assets/logos/IC_logo_horizontal_white.svg" alt="Internet Computer" className="h-10 w-auto" />
        <span className="flex items-center text-lg">+</span>
        <Image src="/assets/logos/abstract.svg" alt="Abstract" className="h-10 w-auto" />
      </div>
      
      <Card className="bg-slate-100 dark:bg-slate-800 p-4 shadow-sm">
        <CardContent className="pt-4 px-2">
          <p className="text-sm text-center mb-4">
            Connect with both Internet Identity and Abstract in one streamlined process. 
            First authenticate with Internet Computer, then link your Abstract wallet for 
            a complete Web3 experience.
          </p>
        </CardContent>
      </Card>
      
      <Button 
        onClick={handleCombinedLogin}
        className="pixel-font w-full h-auto py-3"
        variant="default"
        disabled={isLoading}
      >
        <span className="flex items-center gap-2">
          <span className="flex gap-1">
            <Globe className="w-4 h-4" />
            <Wallet className="w-4 h-4" />
          </span>
          <span>
            {isLoading ? "Connecting..." : "Connect with Abstract via Internet Identity"}
          </span>
        </span>
      </Button>
    </div>
  );
}