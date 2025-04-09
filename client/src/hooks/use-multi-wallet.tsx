import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useNFID } from '@/hooks/use-nfid';
import { useLoginWithAbstract } from '@abstract-foundation/agw-react';
import { useLocation } from 'wouter';

type WalletType = 'abstract' | 'nfid' | null;

/**
 * Custom hook to handle multiple wallet types
 * Provides a unified interface for working with both Abstract Global Wallet and NFID
 * 
 * @returns {Object} Object containing wallet connection state and methods
 */
export function useMultiWallet() {
  const [activeWalletType, setActiveWalletType] = useState<WalletType>(null);
  const [walletAddress, setWalletAddress] = useState<string | undefined>(undefined);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [, setLocation] = useLocation();

  // Get auth and wallet hooks
  const { user, updateProfileMutation, disconnect: authDisconnect, isConnecting } = useAuth();
  const { connect: nfidConnect, disconnect: nfidDisconnect, getPrincipal } = useNFID();
  
  // Use Abstract wallet hooks
  const abstractLogin = useLoginWithAbstract();
  const abstractLogout = abstractLogin.logout;

  /**
   * Disconnect from the active wallet
   * Performs wallet-specific disconnection and then triggers the auth disconnect
   * This ensures a unified disconnection flow for both wallet types
   * 
   * @returns {Promise<void>} Promise that resolves when disconnection is complete
   */
  const disconnect = useCallback(async () => {
    try {
      setError(null);
      console.log("Disconnecting wallet type:", activeWalletType);
      
      // First disconnect the specific wallet
      if (activeWalletType === 'abstract') {
        console.log("Attempting to disconnect from Abstract wallet");
        // Force a disconnect call on abstract even if not the active wallet
        try {
          abstractLogout();
          console.log("Abstract wallet disconnected successfully");
        } catch (abstractErr) {
          console.warn("Error disconnecting from Abstract wallet:", abstractErr);
          // Continue with disconnection flow even if Abstract fails
        }
      } else if (activeWalletType === 'nfid') {
        console.log("Attempting to disconnect from NFID wallet");
        try {
          await nfidDisconnect();
          console.log("NFID wallet disconnected successfully");
        } catch (nfidErr) {
          console.warn("Error disconnecting from NFID wallet:", nfidErr);
          // Continue with disconnection flow even if NFID fails
        }
      }
      
      // Always disconnect from auth context regardless of wallet-specific disconnection success
      console.log("Calling auth disconnect");
      await authDisconnect();
      console.log("Auth disconnect completed");
      
      // Reset local state
      setActiveWalletType(null);
      setWalletAddress(undefined);
      setIsConnected(false);
      
      // Force a redirect to the splash page
      console.log("Redirecting to splash page");
      setLocation("/");
      
      // Force a page reload to clear any persistent state
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (err) {
      console.error("Error in disconnect flow:", err);
      setError(err instanceof Error ? err : new Error("Failed to disconnect from wallet"));
      
      // Even if there's an error, try to reset state and redirect
      setActiveWalletType(null);
      setWalletAddress(undefined);
      setIsConnected(false);
      setLocation("/");
    }
  }, [activeWalletType, abstractLogout, nfidDisconnect, authDisconnect, setLocation]);

  // Effect to update connection status when auth address changes (for Abstract wallet)
  useEffect(() => {
    // The address from useAuth will update when Abstract wallet connects
    if (user && user.walletAddress && activeWalletType !== 'nfid') {
      setWalletAddress(user.walletAddress);
      setIsConnected(true);
      setActiveWalletType('abstract');
    }
  }, [user, activeWalletType]);

  // Effect to check NFID connection status on mount
  useEffect(() => {
    const checkNFIDConnection = async () => {
      try {
        const principal = getPrincipal();
        if (principal) {
          setWalletAddress(principal);
          setIsConnected(true);
          setActiveWalletType('nfid');
          
          // Update the user profile if we're connected but don't have a wallet saved yet
          if (user && !user.walletAddress) {
            await updateProfileMutation.mutateAsync({
              walletAddress: principal
            });
          }
        }
      } catch (err) {
        console.error("Error checking NFID connection:", err);
      }
    };
    
    checkNFIDConnection();
  }, [getPrincipal, user, updateProfileMutation]);

  return {
    activeWalletType,
    walletAddress,
    isConnected,
    disconnect,
    error,
    isAbstractConnecting: isConnecting  // Use isConnecting from auth hook
  };
}