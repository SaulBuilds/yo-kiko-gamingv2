import React, { useEffect, useRef } from 'react';
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
  const { connect: connectNFID, isConnecting: isNFIDConnecting, error: nfidError } = useNFID();
  const [error, setError] = React.useState<string | null>(null);
  const nfidContainerRef = useRef<HTMLDivElement>(null);

  // Move NFID interface into our modal when it appears
  useEffect(() => {
    if (!isOpen) return;

    // Create an observer to watch for NFID UI elements appearing
    const observer = new MutationObserver((mutations) => {
      // Look for bottom bar elements when they appear
      const nfidBottomBar = document.querySelector('div[style*="position: fixed"][style*="bottom: 0"]');
      if (nfidBottomBar && nfidContainerRef.current) {
        // Clone the element and move it to our container
        try {
          // Stop observing to prevent loops
          observer.disconnect();
          
          // Move the element inside our container
          nfidContainerRef.current.innerHTML = '';
          nfidContainerRef.current.appendChild(nfidBottomBar);
          
          // Style the moved element
          if (nfidBottomBar instanceof HTMLElement) {
            nfidBottomBar.style.position = 'static';
            nfidBottomBar.style.bottom = 'auto';
            nfidBottomBar.style.left = 'auto';
            nfidBottomBar.style.right = 'auto';
            nfidBottomBar.style.width = '100%';
            nfidBottomBar.style.maxWidth = '100%';
            nfidBottomBar.style.borderRadius = '8px';
            nfidBottomBar.style.margin = '0';
            nfidBottomBar.style.background = 'transparent';
          }
          
          // Re-observe after modifications
          observer.observe(document.body, { childList: true, subtree: true });
        } catch (err) {
          console.error("Error moving NFID interface:", err);
        }
      }
    });
    
    // Start observing
    observer.observe(document.body, { childList: true, subtree: true });
    
    // Clean up
    return () => {
      observer.disconnect();
    };
  }, [isOpen]);

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
      // Simply trigger the NFID connection - the UI will be handled by our observer
      await connectNFID();
      await onClose();
    } catch (err: any) {
      console.error("Error connecting to NFID wallet:", err);
      setError(err?.message || "Failed to connect to NFID wallet");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Connect Your Wallet</DialogTitle>
          <DialogDescription>
            Choose a wallet to connect with and start playing
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
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

          {/* NFID Wallet Button - This now activates the real NFID interface */}
          <div className="w-full">
            {/* NFID button that triggers the connection */}
            <Button
              onClick={() => {
                // Let the user know something is happening
                setError(null);
                console.log("Activating NFID wallet interface...");
                // Our observer will handle the UI
                handleNFIDConnect();
              }}
              disabled={isNFIDConnecting || isAbstractConnecting}
              className="w-full py-6 relative"
              variant="outline"
            >
              {isNFIDConnecting ? (
                <Spinner className="mr-2" />
              ) : (
                <img 
                  src="/assets/nfid-logo.svg" 
                  alt="NFID" 
                  className="w-6 h-6 mr-2"
                />
              )}
              <div className="flex flex-col items-start">
                <span className="font-semibold">NFID</span>
                <span className="text-xs text-muted-foreground">Connect with Internet Computer</span>
              </div>
            </Button>
            
            {/* Container where the NFID interface will be moved */}
            <div 
              ref={nfidContainerRef} 
              className="mt-4 w-full rounded-md overflow-hidden"
            ></div>
          </div>

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
  );
}