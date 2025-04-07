import { useState, useCallback, useEffect } from "react";
import { useIdentityKit } from "@nfid/identitykit/react";

// Extend the Window interface to include our global functions
declare global {
  interface Window {
    showNFIDContainer?: () => void;
    hideNFIDContainer?: () => void;
  }
}

/**
 * Custom hook to interact with NFID wallet
 * 
 * @returns {Object} Object containing connect function and connection state
 */
export function useNFID() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const nfidIdentityKit = useIdentityKit();

  // Simple function to show the NFID UI using our global container
  const showNFIDModal = useCallback(() => {
    // Use the global function we defined in NFIDProvider
    if (typeof window.showNFIDContainer === 'function') {
      window.showNFIDContainer();
    }
  }, []);

  // Simple function to hide the NFID UI using our global container
  const hideNFIDModal = useCallback(() => {
    // Use the global function we defined in NFIDProvider
    if (typeof window.hideNFIDContainer === 'function') {
      window.hideNFIDContainer();
    }
  }, []);

  // Cleanup function to ensure the modal is hidden when the component unmounts
  useEffect(() => {
    return () => {
      hideNFIDModal();
    };
  }, [hideNFIDModal]);

  /**
   * Connect to NFID wallet
   * 
   * @returns {Promise<void>} Promise that resolves when connection is complete
   */
  const connect = useCallback(async (): Promise<void> => {
    setIsConnecting(true);
    setError(null);
    
    // Show the NFID modal before attempting connection
    showNFIDModal();
    
    try {
      console.log("Initiating NFID connection...");
      await nfidIdentityKit.connect();
      console.log("NFID connection successful");
      // Hide modal after successful connection
      hideNFIDModal(); 
      return Promise.resolve();
    } catch (err) {
      console.error("NFID connection error:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
      // Hide modal on error
      hideNFIDModal();
      return Promise.reject(err);
    } finally {
      setIsConnecting(false);
    }
  }, [nfidIdentityKit, showNFIDModal, hideNFIDModal]);

  /**
   * Disconnect from NFID wallet
   * 
   * @returns {Promise<void>} Promise that resolves when disconnection is complete
   */
  const disconnect = useCallback(async (): Promise<void> => {
    try {
      console.log("Disconnecting from NFID...");
      
      // Ensure the modal is hidden during disconnection
      hideNFIDModal();
      
      await nfidIdentityKit.disconnect();
      console.log("NFID disconnection successful");
      return Promise.resolve();
    } catch (err) {
      console.error("NFID disconnection error:", err);
      return Promise.reject(err);
    }
  }, [nfidIdentityKit, hideNFIDModal]);

  /**
   * Get the NFID principal ID
   * 
   * @returns {string | undefined} The principal ID if connected, undefined otherwise
   */
  const getPrincipal = useCallback((): string | undefined => {
    try {
      return nfidIdentityKit.user?.principal.toString();
    } catch (err) {
      console.error("Error getting NFID principal:", err);
      return undefined;
    }
  }, [nfidIdentityKit]);

  return {
    connect,
    disconnect,
    getPrincipal,
    isConnecting,
    error
  };
}