import { useState, useCallback } from 'react';
import { useAuth as useAbstractAuth } from '@/hooks/use-auth';
import { useAuth as useNFIDAuth } from '@nfid/identitykit/react';

type WalletType = 'abstract' | 'nfid' | null;

/**
 * Custom hook to handle multiple wallet types
 * Provides a unified interface for working with both Abstract Global Wallet and NFID
 */
export function useMultiWallet() {
  const [activeWalletType, setActiveWalletType] = useState<WalletType>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Abstract wallet hooks
  const { 
    user: abstractUser, 
    connect: abstractConnect, 
    disconnect: abstractDisconnect,
    isConnecting: isAbstractConnecting,
    address: abstractAddress
  } = useAbstractAuth();
  
  // NFID wallet hooks
  const { 
    user: nfidUser, 
    connect: nfidConnect, 
    disconnect: nfidDisconnect,
    isConnecting: isNFIDConnecting
  } = useNFIDAuth();

  /**
   * Opens the wallet selection modal
   */
  const openWalletModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  /**
   * Closes the wallet selection modal
   */
  const closeWalletModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  /**
   * Handle Abstract wallet connection
   */
  const handleAbstractConnect = useCallback(async () => {
    try {
      await abstractConnect();
      setActiveWalletType('abstract');
      return true;
    } catch (error) {
      console.error('Failed to connect to Abstract wallet', error);
      return false;
    }
  }, [abstractConnect]);

  /**
   * Handle NFID wallet connection
   */
  const handleNFIDConnect = useCallback(async () => {
    try {
      await nfidConnect();
      setActiveWalletType('nfid');
      return true;
    } catch (error) {
      console.error('Failed to connect to NFID wallet', error);
      return false;
    }
  }, [nfidConnect]);

  /**
   * Disconnect from the active wallet
   */
  const disconnect = useCallback(async () => {
    if (activeWalletType === 'abstract') {
      await abstractDisconnect();
    } else if (activeWalletType === 'nfid') {
      await nfidDisconnect();
    }
    
    setActiveWalletType(null);
  }, [activeWalletType, abstractDisconnect, nfidDisconnect]);

  // Determine the currently active user
  const currentUser = activeWalletType === 'abstract' 
    ? abstractUser 
    : activeWalletType === 'nfid' 
      ? nfidUser 
      : null;

  // Get current wallet address
  const getWalletAddress = useCallback(() => {
    if (activeWalletType === 'abstract') {
      return abstractAddress;
    } else if (activeWalletType === 'nfid' && nfidUser) {
      return nfidUser.principal.toString();
    }
    return undefined;
  }, [activeWalletType, abstractAddress, nfidUser]);

  // Check if any wallet is connected
  const isConnected = Boolean(currentUser);

  // Combine connecting states
  const isConnecting = isAbstractConnecting || isNFIDConnecting;

  return {
    isConnected,
    isConnecting,
    currentUser,
    activeWalletType,
    walletAddress: getWalletAddress(),
    connect: {
      abstract: handleAbstractConnect,
      nfid: handleNFIDConnect
    },
    disconnect,
    modal: {
      isOpen: isModalOpen,
      open: openWalletModal,
      close: closeWalletModal
    },
    abstractUser,
    nfidUser,
    isAbstractConnecting,
    isNFIDConnecting,
  };
}