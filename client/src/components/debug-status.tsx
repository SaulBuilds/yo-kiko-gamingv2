import React, { useState, useEffect } from 'react';
import { useMultiWallet } from '@/hooks/use-multi-wallet';

/**
 * A debug component that displays the current connection status
 * Only visible in development mode
 */
export function DebugStatus() {
  const { 
    isConnected, 
    walletAddress, 
    activeWalletType,
    error
  } = useMultiWallet();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show in development
    if (process.env.NODE_ENV === 'development' || import.meta.env.DEV) {
      setIsVisible(true);
    }
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <div 
      className="fixed top-2 right-2 p-2 bg-black/90 text-white rounded text-xs max-w-xs z-[9999] font-mono overflow-auto"
      style={{ maxHeight: '200px' }}
    >
      <div className="mb-1 font-bold">🛠️ Debug Connection Status</div>
      <div>Connected: {isConnected ? "✅" : "❌"}</div>
      <div>Wallet Type: {activeWalletType || "None"}</div>
      <div className="truncate">Address: {walletAddress || "None"}</div>
      {error && (
        <div className="text-red-400">Error: {error.message}</div>  
      )}
      <div className="text-gray-400 mt-1">Click to toggle modal:</div>
      <button 
        className="px-2 py-1 bg-blue-700 text-white rounded text-xs mt-1"
        onClick={() => {
          const connectButton = document.querySelector('[class*="pixel-font"]') as HTMLElement;
          if (connectButton) {
            connectButton.click();
          }
        }}
      >
        Toggle Wallet Modal
      </button>
    </div>
  );
}