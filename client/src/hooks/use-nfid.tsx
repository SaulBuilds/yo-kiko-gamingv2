import { useState, useCallback } from "react";
import { useIdentityKit } from "@nfid/identitykit/react";

/**
 * Custom hook to interact with NFID wallet
 * 
 * @returns {Object} Object containing connect function and connection state
 */
export function useNFID() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const nfidIdentityKit = useIdentityKit();

  /**
   * Connect to NFID wallet
   * 
   * @returns {Promise<void>} Promise that resolves when connection is complete
   */
  const connect = useCallback(async (): Promise<void> => {
    setIsConnecting(true);
    setError(null);
    
    try {
      console.log("Initiating NFID connection...");
      await nfidIdentityKit.connect();
      console.log("NFID connection successful");
      return Promise.resolve();
    } catch (err) {
      console.error("NFID connection error:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
      return Promise.reject(err);
    } finally {
      setIsConnecting(false);
    }
  }, [nfidIdentityKit]);

  /**
   * Disconnect from NFID wallet
   * 
   * @returns {Promise<void>} Promise that resolves when disconnection is complete
   */
  const disconnect = useCallback(async (): Promise<void> => {
    try {
      console.log("Disconnecting from NFID...");
      await nfidIdentityKit.disconnect();
      console.log("NFID disconnection successful");
      return Promise.resolve();
    } catch (err) {
      console.error("NFID disconnection error:", err);
      return Promise.reject(err);
    }
  }, [nfidIdentityKit]);

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