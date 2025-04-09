import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useNFID } from '@/hooks/use-nfid';
import { useLoginWithAbstract } from '@abstract-foundation/agw-react';

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

  // Get auth and wallet hooks
  const { user, updateProfileMutation } = useAuth();
  const {
    connect: nfidConnect,
    disconnect: nfidDisconnect,
    getPrincipal,
    isConnected: isNFIDConnected
  } = useNFID();
  
  // Use the Abstract login hook
  const abstractLogin = useLoginWithAbstract();
  const isAbstractLoggedIn = !!(abstractLogin as any).isLoggedIn;
  const abstractAddress = (abstractLogin as any).address as string | undefined;
  const abstractLogout = (abstractLogin as any).logout as () => void;
  const isAbstractLoggingIn = !!(abstractLogin as any).isLoggingIn;

  /**
   * Connect to NFID wallet
   * 
   * @returns {Promise<void>} Promise that resolves when connection is complete
   */
  const connectNFID = useCallback(async (): Promise<void> => {
    try {
      setError(null);
      await nfidConnect();
      
      // Check if connection was successful
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
      
      return Promise.resolve();
    } catch (err) {
      console.error("Error connecting to NFID wallet:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
      return Promise.reject(err);
    }
  }, [nfidConnect, getPrincipal, user, updateProfileMutation]);

  /**
   * Connect to Abstract wallet
   * 
   * @returns {Promise<void>} Promise that resolves when connection is complete
   */
  const connectAbstract = useCallback(async (): Promise<void> => {
    try {
      setError(null);
      await (abstractLogin as any).login();
      
      // The connection status will be picked up by the effect below
      return Promise.resolve();
    } catch (err) {
      console.error("Error connecting to Abstract wallet:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
      return Promise.reject(err);
    }
  }, [abstractLogin]);

  /**
   * Disconnect from the active wallet
   * 
   * @returns {Promise<void>} Promise that resolves when disconnection is complete
   */
  const disconnect = useCallback(async () => {
    try {
      setError(null);
      if (activeWalletType === 'abstract') {
        abstractLogout();
      } else if (activeWalletType === 'nfid') {
        await nfidDisconnect();
      }
      
      setActiveWalletType(null);
      setWalletAddress(undefined);
      setIsConnected(false);
    } catch (err) {
      console.error("Error disconnecting from wallet:", err);
      setError(err instanceof Error ? err : new Error("Failed to disconnect from wallet"));
    }
  }, [activeWalletType, abstractLogout, nfidDisconnect]);

  // Effect to update connection status when Abstract wallet status changes
  useEffect(() => {
    if (isAbstractLoggedIn && abstractAddress) {
      setWalletAddress(abstractAddress);
      setIsConnected(true);
      setActiveWalletType('abstract');
      
      // Update the user profile if we're connected but don't have a wallet saved yet
      if (user && !user.walletAddress) {
        updateProfileMutation.mutate({
          walletAddress: abstractAddress
        });
      }
    }
  }, [isAbstractLoggedIn, abstractAddress, user, updateProfileMutation]);

  // Effect to check NFID connection status on mount
  useEffect(() => {
    const checkNFIDConnection = async () => {
      try {
        if (isNFIDConnected) {
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
        }
      } catch (err) {
        console.error("Error checking NFID connection:", err);
      }
    };
    
    checkNFIDConnection();
  }, [isNFIDConnected, getPrincipal, user, updateProfileMutation]);

  return {
    activeWalletType,
    walletAddress,
    isConnected,
    connectNFID,
    connectAbstract,
    disconnect,
    error,
    isAbstractConnecting: isAbstractLoggingIn
  };
}