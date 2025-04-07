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
  const { connect: nfidConnect, disconnect: nfidDisconnect, getPrincipal } = useNFID();
  const { 
    isLoggedIn: isAbstractLoggedIn, 
    address: abstractAddress,
    logout: abstractLogout,
    isLoggingIn: isAbstractLoggingIn 
  } = useLoginWithAbstract();

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
    isAbstractConnecting: isAbstractLoggingIn
  };
}