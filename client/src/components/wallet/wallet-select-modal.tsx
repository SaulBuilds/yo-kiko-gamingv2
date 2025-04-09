import React, { useEffect, useRef, useState } from 'react';
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
  const [error, setError] = useState<string | null>(null);
  const nfidContainerRef = useRef<HTMLDivElement>(null);
  const [nfidUIVisible, setNfidUIVisible] = useState(false);

  // Setup handler to capture and relocate NFID UI to our modal
  useEffect(() => {
    if (!isOpen) return;

    // Define a style for NFID elements when they're in our container
    const styleElement = document.createElement('style');
    styleElement.innerHTML = `
      /* Container styling when NFID UI is present */
      .nfid-container-active {
        border: 1px solid rgba(255, 255, 255, 0.1);
        background-color: rgba(0, 0, 0, 0.2);
        padding: 8px;
        border-radius: 8px;
      }
      
      /* Style for NFID UI elements once relocated */
      .nfid-container-active > div {
        position: static !important;
        margin: 0 !important;
        width: 100% !important;
        max-width: 100% !important;
        border-radius: 8px !important;
        background: transparent !important;
        bottom: auto !important;
        left: auto !important;
        right: auto !important;
      }
    `;
    
    document.head.appendChild(styleElement);

    // Create an observer to watch for NFID UI elements appearing
    const observer = new MutationObserver((mutations) => {
      // Look for bottom bar elements when they appear
      const nfidElements = document.querySelector('div[style*="position: fixed"][style*="bottom: 0"]');
      if (nfidElements && nfidContainerRef.current) {
        try {
          // Stop observing to prevent loops
          observer.disconnect();
          
          // Move the element to our container
          nfidContainerRef.current.innerHTML = '';
          nfidContainerRef.current.appendChild(nfidElements);
          nfidContainerRef.current.classList.add('nfid-container-active');
          
          // Mark that we have NFID UI visible
          setNfidUIVisible(true);
          
          // Re-observe after modifications
          observer.observe(document.body, { childList: true, subtree: true });
        } catch (err) {
          console.error("Error relocating NFID interface:", err);
        }
      }
    });
    
    // Start observing
    observer.observe(document.body, { childList: true, subtree: true });
    
    // Clean up
    return () => {
      observer.disconnect();
      document.head.removeChild(styleElement);
      setNfidUIVisible(false);
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
      console.log("Activating NFID wallet interface...");
      // Simply start the connection - our observer will handle the UI
      await connectNFID();
      // Don't close the modal right away - let the user interact with the NFID UI
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

          {/* NFID Wallet Option */}
          <div className="w-full">
            {/* Only show the button if NFID UI is not yet visible */}
            {!nfidUIVisible && (
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
            )}
            
            {/* Container where NFID UI will be moved */}
            <div 
              ref={nfidContainerRef} 
              className={`mt-4 w-full rounded-md overflow-hidden transition-all duration-200 ${
                nfidUIVisible ? 'opacity-100' : 'opacity-0 h-0'
              }`}
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