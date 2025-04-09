import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNFID } from '@/hooks/use-nfid';
import { Wallet, ExternalLink } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => Promise<void>;
  useAbstractWalletConnect: () => Promise<void>;
  isAbstractConnecting: boolean;
}

/**
 * A fixed, simplified wallet selection modal
 * 
 * @param {ModalProps} props - Component props
 * @returns {JSX.Element | null} The wallet selection modal
 */
export function FixedModal({
  isOpen,
  onClose,
  useAbstractWalletConnect,
  isAbstractConnecting
}: ModalProps) {
  console.log("[FIXED MODAL] Render:", { isOpen, isAbstractConnecting });
  
  const { connect: connectNFID, isConnecting: isNFIDConnecting } = useNFID();
  const [error, setError] = useState<string | null>(null);
  const [modalRoot, setModalRoot] = useState<HTMLElement | null>(null);
  
  // Effect to set the modal root
  useEffect(() => {
    setModalRoot(document.body);
  }, []);
  
  // Nothing to render if modal is closed
  if (!isOpen) {
    return null;
  }
  
  // Handle Abstract wallet connection
  const handleAbstractConnect = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      setError(null);
      console.log("Connecting to Abstract wallet...");
      await useAbstractWalletConnect();
      await onClose();
    } catch (err: any) {
      console.error("Error connecting to Abstract wallet:", err);
      setError(err?.message || "Failed to connect to Abstract wallet");
    }
  };

  // Handle NFID wallet connection
  const handleNFIDConnect = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      setError(null);
      console.log("Connecting to NFID wallet...");
      await connectNFID();
      await onClose();
    } catch (err: any) {
      console.error("Error connecting to NFID wallet:", err);
      setError(err?.message || "Failed to connect to NFID wallet");
    }
  };

  // Handle closing the modal
  const handleClose = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
  };

  // Simple loading spinner component
  const Spinner = ({ className = "" }: { className?: string }) => (
    <div className={`animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent ${className}`} />
  );

  const modalContent = (
    <div className="fixed inset-0 bg-black/70 z-[9999]" onClick={(e) => e.stopPropagation()}>
      <div className="w-full h-full flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6 m-4 relative">
          <button 
            onClick={handleClose}
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ✕
          </button>
          
          <div className="mb-4">
            <h2 className="text-xl font-bold">Connect Your Wallet</h2>
            <p className="text-gray-500 dark:text-gray-400">
              Choose a wallet to connect with and start playing
            </p>
          </div>
          
          <div className="space-y-4">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-md">
                {error}
              </div>
            )}

            {/* Abstract Wallet Option */}
            <button
              onClick={handleAbstractConnect}
              disabled={isAbstractConnecting || isNFIDConnecting}
              className={`w-full py-4 px-4 flex items-center border rounded-lg 
                ${isAbstractConnecting || isNFIDConnecting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-gray-700'} 
                transition-colors`}
            >
              {isAbstractConnecting ? (
                <Spinner className="mr-3" />
              ) : (
                <div className="w-6 h-6 mr-3 bg-gray-800 text-white rounded-full flex items-center justify-center">
                  <Wallet className="w-4 h-4" />
                </div>
              )}
              <div className="text-left">
                <div className="font-semibold">Abstract Wallet</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Connect with your EVM wallet</div>
              </div>
            </button>

            {/* NFID Wallet Option */}
            <button
              onClick={handleNFIDConnect}
              disabled={isNFIDConnecting || isAbstractConnecting}
              className={`w-full py-4 px-4 flex items-center border rounded-lg 
                ${isNFIDConnecting || isAbstractConnecting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-gray-700'} 
                transition-colors`}
            >
              {isNFIDConnecting ? (
                <Spinner className="mr-3" />
              ) : (
                <div className="w-6 h-6 mr-3 bg-purple-700 text-white rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold">IC</span>
                </div>
              )}
              <div className="text-left">
                <div className="font-semibold">NFID</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Connect with Internet Computer</div>
              </div>
            </button>

            <div className="text-xs text-center text-gray-500 dark:text-gray-400 mt-4">
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
        </div>
      </div>
    </div>
  );

  // Handle portal rendering
  if (!modalRoot) {
    return isOpen ? modalContent : null;
  }

  return createPortal(modalContent, modalRoot);
}