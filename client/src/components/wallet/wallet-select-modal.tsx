import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter,
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState } from "react";
import { useNFID } from "@/hooks/use-nfid";

/**
 * Props for the WalletSelectModal component
 */
interface WalletSelectModalProps {
  /**
   * Determines if the modal is open
   */
  isOpen: boolean;
  /**
   * Function to call when the modal is closed
   */
  onClose: () => Promise<void>;
  /**
   * Function to use for Abstract wallet connection
   */
  useAbstractWalletConnect: () => Promise<void>;
  /**
   * Boolean indicating if Abstract wallet is connecting
   */
  isAbstractConnecting: boolean;
}

/**
 * WalletSelectModal component that displays a modal with wallet connection options
 * 
 * @param {WalletSelectModalProps} props - Component props
 * @returns {JSX.Element} The rendered component
 */
export function WalletSelectModal({ 
  isOpen, 
  onClose,
  useAbstractWalletConnect,
  isAbstractConnecting
}: WalletSelectModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { connect: connectNFID, isConnecting: isNFIDConnecting } = useNFID();

  const handleAbstractConnect = async () => {
    setIsLoading(true);
    try {
      await useAbstractWalletConnect();
      // Modal will be closed by auth handler in useAuth after successful connection
    } catch (error) {
      console.error("Error connecting with Abstract:", error);
      setIsLoading(false);
    }
  };

  const handleNFIDConnect = async () => {
    setIsLoading(true);
    try {
      await connectNFID();
      // Modal will be closed by auth handler in useAuth after successful connection
    } catch (error) {
      console.error("Error connecting with NFID:", error);
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        void onClose();
      }
    }}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Connect Your Wallet</DialogTitle>
          <DialogDescription>
            Choose your preferred wallet to connect and start playing
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          <Card className="cursor-pointer hover:border-primary transition-all" onClick={handleAbstractConnect}>
            <CardHeader className="pb-2">
              <CardTitle>Abstract Wallet</CardTitle>
              <CardDescription>Connect with Ethereum</CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="h-24 flex items-center justify-center">
                <img 
                  src="/assets/abstract_logo.svg" 
                  alt="Abstract Wallet" 
                  className="h-12 w-auto object-contain" 
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

          <Card className="cursor-pointer hover:border-primary transition-all" onClick={handleNFIDConnect}>
            <CardHeader className="pb-2">
              <CardTitle>NFID Wallet</CardTitle>
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