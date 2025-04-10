import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ExternalLink } from "lucide-react";

// Import our specialized wallet button components
import { NFIDModalButton } from "@/components/nfid/nfid-modal-button";
import { AbstractModalButton } from "@/components/abstract/abstract-modal-button";

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
  const [error, setError] = useState<string | null>(null);

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
          {/* Global error display */}
          {error && (
            <div className="bg-destructive/20 border border-destructive text-destructive px-4 py-2 rounded-md">
              {error}
            </div>
          )}

          {/* Abstract Wallet Option */}
          <AbstractModalButton
            onConnect={useAbstractWalletConnect}
            isConnecting={isAbstractConnecting}
            onClose={onClose}
          />

          {/* NFID Wallet Option */}
          <NFIDModalButton onClose={onClose} />

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