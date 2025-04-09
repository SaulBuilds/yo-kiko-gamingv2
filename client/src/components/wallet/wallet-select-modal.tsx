import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNFID } from "@/hooks/use-nfid";
import { Spinner } from "../ui/spinner";
import { ExternalLink } from "lucide-react";

interface WalletSelectModalProps {
  isOpen: boolean;
  onClose: () => Promise<void>;
  useAbstractWalletConnect: () => Promise<void>;
  isAbstractConnecting: boolean;
}

/**
 * Modal for selecting between different wallet types
 * 
 * @param {WalletSelectModalProps} props - Component props
 * @returns {JSX.Element} The wallet selection modal
 */
export function WalletSelectModal({
  isOpen,
  onClose,
  useAbstractWalletConnect,
  isAbstractConnecting
}: WalletSelectModalProps) {
  // Debug log to verify the modal state
  console.log("WalletSelectModal render state:", { isOpen, isAbstractConnecting });
  const { connect: connectNFID, isConnecting: isNFIDConnecting, error: nfidError } = useNFID();
  const [error, setError] = React.useState<string | null>(null);

  // Handle Abstract wallet connection
  const handleAbstractConnect = async () => {
    try {
      setError(null);
      await useAbstractWalletConnect();
      await onClose();
    } catch (err: any) {
      console.error("Error connecting to Abstract wallet:", err);
      setError(err?.message || "Failed to connect to Abstract wallet");
    }
  };

  // Handle NFID wallet connection
  const handleNFIDConnect = async () => {
    try {
      setError(null);
      await connectNFID();
      await onClose();
    } catch (err: any) {
      console.error("Error connecting to NFID wallet:", err);
      setError(err?.message || "Failed to connect to NFID wallet");
    }
  };

  return (
    <div className="wallet-modal">
      <Dialog open={isOpen} onOpenChange={() => onClose()}>
        <DialogContent className="sm:max-w-md z-50 relative">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Connect Your Wallet</DialogTitle>
            <DialogDescription>
              Choose a wallet to connect with and start playing
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4 bg-blue-100 dark:bg-blue-900">
            <div className="text-center p-2 font-bold">Wallet Options</div>
            {error && (
              <div className="bg-destructive/20 border border-destructive text-destructive px-4 py-2 rounded-md">
                {error}
              </div>
            )}

            {/* Abstract Wallet Option */}
            <Button
              onClick={handleAbstractConnect}
              disabled={isAbstractConnecting || isNFIDConnecting}
              className="w-full py-6 relative"
              variant="outline"
            >
              {isAbstractConnecting ? (
                <Spinner className="mr-2" />
              ) : (
                <img 
                  src="/assets/abstract-logo.svg" 
                  alt="Abstract Wallet" 
                  className="w-6 h-6 mr-2"
                />
              )}
              <div className="flex flex-col items-start">
                <span className="font-semibold">Abstract Wallet</span>
                <span className="text-xs text-muted-foreground">Connect with your EVM wallet</span>
              </div>
            </Button>

            {/* NFID Wallet Option */}
            <Button
              onClick={handleNFIDConnect}
              disabled={isNFIDConnecting || isAbstractConnecting}
              className="w-full py-6 relative"
              variant="outline"
            >
              {isNFIDConnecting ? (
                <Spinner className="mr-2" />
              ) : (
                <img 
                  src="/nfid-simple.svg" 
                  alt="NFID" 
                  className="w-6 h-6 mr-2"
                />
              )}
              <div className="flex flex-col items-start">
                <span className="font-semibold">NFID</span>
                <span className="text-xs text-muted-foreground">Connect with Internet Computer</span>
              </div>
            </Button>

            <div className="text-xs text-center text-muted-foreground mt-2">
              <a 
                href="https://docs.y-kiko.com/wallets" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1 hover:underline"
              >
                Learn more about our supported wallets <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}