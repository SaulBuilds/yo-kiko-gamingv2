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
      
      // First: Real Internet Identity login using AuthClient
      console.log("Starting ICP authentication...");
      
      // Import AuthClient dynamically to avoid issues with server-side rendering
      const { AuthClient } = await import('@dfinity/auth-client');
      const { getOrCreateDeviceFingerprint } = await import('../lib/device-fingerprint');
      
      // Create auth client
      const authClient = await AuthClient.create();
      
      // Get device fingerprint for device-specific identity
      const deviceId = getOrCreateDeviceFingerprint();
      
      // Initiate the Internet Identity login flow
      await authClient.login({
        identityProvider: 'https://identity.ic0.app/#authorize',
        onSuccess: async () => {
          // Get the authenticated identity and principal
          const identity = authClient.getIdentity();
          const principal = identity.getPrincipal().toText();
          
          // Store the principal in localStorage
          localStorage.setItem('icp_principal', principal);
          
          // Register the user with the backend, including the device fingerprint
          const response = await fetch("/api/user", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ 
              walletAddress: principal,
              walletType: "icp",
              deviceId: deviceId
            }),
          });
          
          if (!response.ok) {
            throw new Error('Failed to create user with ICP identity');
          }
          
          toast({
            title: "Step 1 Complete",
            description: "Internet Identity authenticated! Connecting with Abstract wallet...",
          });
          
          // Second: Abstract login 
          console.log("Starting Abstract login...");
          
          // Trigger Abstract login - this will open the Abstract modal
          loginWithAbstract();
        },
        onError: (error) => {
          console.error("ICP authentication error:", error);
          toast({
            title: "Internet Identity Authentication Failed",
            description: "Could not authenticate with Internet Identity. Please try again.",
            variant: "destructive",
          });
          setIsLoading(false);
        }
      });
      
    } catch (error) {
      console.error("Combined login error:", error);
      toast({
        title: "Connection Failed",
        description: "Could not complete the authentication process. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4 justify-center">
        <Image src="/assets/IC_logo_horizontal_white.svg" alt="Internet Computer" className="h-10 w-auto" />
        <span className="flex items-center text-lg">+</span>
        <Image src="/assets/abstract.svg" alt="Abstract" className="h-10 w-auto" />
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