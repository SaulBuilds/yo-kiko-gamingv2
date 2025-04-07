import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth as useNFIDAuth } from "@nfid/identitykit/react";

interface WalletSelectModalProps {
  isOpen: boolean;
  onClose: () => Promise<void> | void;
  onSuccess?: () => void;
  useAbstractWalletConnect: () => Promise<void>;
  isAbstractConnecting: boolean;
}

export function WalletSelectModal({
  isOpen,
  onClose,
  onSuccess,
  useAbstractWalletConnect,
  isAbstractConnecting
}: WalletSelectModalProps) {
  const { toast } = useToast();
  const { connect: connectNFID, isConnecting: isNFIDConnecting } = useNFIDAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleNFIDConnect = async () => {
    try {
      setIsLoading(true);
      await connectNFID();
      toast({
        title: "Connected with NFID",
        description: "You've successfully connected with NFID wallet",
      });
      onSuccess?.();
      const result = onClose();
      if (result instanceof Promise) {
        await result;
      }
    } catch (error) {
      console.error("Failed to connect with NFID:", error);
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect with NFID wallet",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAbstractConnect = async () => {
    try {
      await useAbstractWalletConnect();
      onSuccess?.();
      // The onClose will be handled by the parent component after the connection is successful
    } catch (error) {
      console.error("Failed to connect with Abstract Wallet:", error);
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect with Abstract Wallet",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        const result = onClose();
        if (result instanceof Promise) {
          void result;
        }
      }
      return true;
    }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Connect Your Wallet</DialogTitle>
          <DialogDescription>
            Choose your preferred wallet to connect to the platform
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          {/* Abstract Wallet Card */}
          <Card className="hover:border-primary/50 cursor-pointer transition-all" onClick={handleAbstractConnect}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Abstract Wallet</CardTitle>
              <CardDescription>Connect with AGW</CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="h-24 flex items-center justify-center">
                <img 
                  src="/assets/abstract.svg" 
                  alt="Abstract Wallet" 
                  className="h-16 w-auto object-contain" 
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                variant="outline"
                disabled={isAbstractConnecting || isLoading}
              >
                {isAbstractConnecting ? "Connecting..." : "Connect"}
              </Button>
            </CardFooter>
          </Card>

          {/* NFID Wallet Card */}
          <Card className="hover:border-primary/50 cursor-pointer transition-all" onClick={handleNFIDConnect}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">NFID Wallet</CardTitle>
              <CardDescription>Connect with Internet Computer</CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="h-24 flex items-center justify-center">
                <img 
                  src="/assets/IC_logo_horizontal_white.svg" 
                  alt="NFID Wallet" 
                  className="h-12 w-auto object-contain" 
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                variant="outline"
                disabled={isNFIDConnecting || isLoading}
              >
                {isNFIDConnecting ? "Connecting..." : "Connect"}
              </Button>
            </CardFooter>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => {
            const result = onClose();
            if (result instanceof Promise) {
              void result;
            }
          }}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}