import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from "@/components/ui/button";
import { Globe, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from '@/lib/queryClient';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Define global plug type
declare global {
  interface Window {
    ic?: {
      plug?: {
        isConnected: () => Promise<boolean>;
        requestConnect: (options?: { whitelist?: string[], host?: string }) => Promise<boolean>;
        disconnect: () => Promise<void>;
        getPrincipal: () => Promise<string>;
        createAgent: (options?: { whitelist?: string[], host?: string }) => Promise<any>;
        agent: any;
        sessionManager: any;
      }
    }
  }
}

export function ConnectPlug() {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [principal, setPrincipal] = useState<string | null>(null);
  const [isPlugInstalled, setIsPlugInstalled] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const { toast } = useToast();
  const [_, setLocation] = useLocation();

  // Check if Plug is available in the browser
  useEffect(() => {
    const checkPlug = () => {
      const isPlugAvailable = !!window.ic?.plug;
      setIsPlugInstalled(isPlugAvailable);
      
      if (isPlugAvailable) {
        checkConnectionStatus();
      }
    };

    const checkConnectionStatus = async () => {
      try {
        if (window.ic?.plug) {
          const connected = await window.ic.plug.isConnected();
          
          if (connected) {
            const principal = await window.ic.plug.getPrincipal();
            setPrincipal(principal.toString());
            setIsConnected(true);
            
            // If we're on the auth page, redirect to dashboard
            if (window.location.pathname === '/auth') {
              await createUserForICP(principal.toString());
              setLocation('/dashboard');
            }
          }
        }
      } catch (error) {
        console.error("Error checking Plug connection:", error);
      }
    };

    // Check for Plug on initial load
    checkPlug();
    
    // Set up a listener to detect when Plug is injected (may happen after page load)
    const checkPlugInterval = setInterval(() => {
      if (!isPlugInstalled && window.ic?.plug) {
        setIsPlugInstalled(true);
        checkConnectionStatus();
        clearInterval(checkPlugInterval);
      }
    }, 500);
    
    return () => clearInterval(checkPlugInterval);
  }, [setLocation, isPlugInstalled]);

  const shortenPrincipal = (principal: string) => {
    if (!principal) return '';
    return `${principal.slice(0, 6)}...${principal.slice(-4)}`;
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

  const connect = async () => {
    // If Plug is not installed, show the installation modal
    if (!isPlugInstalled) {
      setShowInstallModal(true);
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Request connection to Plug wallet
      const approved = await window.ic?.plug?.requestConnect({
        whitelist: [], // Add your canister IDs here if needed
      });
      
      if (approved) {
        const principal = await window.ic?.plug?.getPrincipal();
        if (principal) {
          const principalText = principal.toString();
          setPrincipal(principalText);
          setIsConnected(true);
          
          // Create user for ICP login
          await createUserForICP(principalText);
          
          toast({
            title: "Success!",
            description: "Connected to Plug wallet",
          });
          
          // Redirect to dashboard
          setLocation("/dashboard");
        }
      } else {
        toast({
          title: "Connection Declined",
          description: "Connection to Plug wallet was declined.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Plug connection error:", error);
      toast({
        title: "Connection Failed",
        description: "Could not connect to Plug wallet. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const disconnect = async () => {
    setIsLoading(true);
    
    try {
      // Disconnect from Plug wallet
      if (window.ic?.plug) {
        await window.ic.plug.disconnect();
      }
      
      setPrincipal(null);
      setIsConnected(false);
      
      // Clear user data from cache
      queryClient.setQueryData(["/api/user"], null);
      
      toast({
        title: "Logged Out",
        description: "Successfully disconnected from Plug wallet",
      });
      
      // Redirect to home page
      setLocation("/");
    } catch (error) {
      console.error("Plug disconnect error:", error);
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
        onClick={disconnect}
        className="pixel-font flex items-center gap-2 w-full"
        variant="outline"
        disabled={isLoading}
      >
        <Globe className="w-4 h-4" />
        {isLoading ? "Disconnecting..." : `Connected with Plug (${shortenPrincipal(principal)})`}
      </Button>
    );
  }

  return (
    <>
      <Button 
        onClick={connect}
        className="pixel-font flex items-center gap-2 w-full"
        variant="secondary"
        disabled={isLoading}
      >
        <Globe className="w-4 h-4" />
        {isLoading ? "Connecting..." : isPlugInstalled ? "Connect with Plug Wallet" : "Install Plug Wallet"}
      </Button>
      
      {/* Install Plug Modal */}
      <Dialog open={showInstallModal} onOpenChange={setShowInstallModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Install Plug Wallet</DialogTitle>
            <DialogDescription>
              Plug is a browser extension wallet for Internet Computer. You need to install it to connect to your ICP tokens.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="border rounded-lg p-4 bg-muted/30">
              <h4 className="font-medium mb-2">Why use Plug?</h4>
              <ul className="space-y-2 text-sm">
                <li>• Securely store and manage your ICP tokens</li>
                <li>• Connect to dapps on the Internet Computer</li>
                <li>• Control your digital identity with a familiar wallet interface</li>
                <li>• Easy to use with a seed phrase backup</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInstallModal(false)}>
              Cancel
            </Button>
            <Button onClick={() => window.open("https://plugwallet.ooo/", "_blank")}>
              Install Plug <ExternalLink className="h-4 w-4 ml-2" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}