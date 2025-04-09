import { useState, useCallback, useEffect } from "react";
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

  // Function to properly show the NFID UI during connection
  const showNFIDModal = useCallback(() => {
    // Target the NFID dialog element
    setTimeout(() => {
      const nfidDialogs = document.querySelectorAll(".identitykit-dialog");
      
      nfidDialogs.forEach(dialog => {
        if (dialog instanceof HTMLElement) {
          // Make it visible
          dialog.style.display = "block";
          // Add attribute for targeting in CSS
          dialog.setAttribute('data-nfid-container', 'true');
          
          // Style it properly
          dialog.style.position = "fixed";
          dialog.style.zIndex = "9999";
          dialog.style.maxWidth = "400px";
          dialog.style.width = "100%";
          dialog.style.backgroundColor = "rgba(0, 0, 0, 0.75)";
          dialog.style.borderRadius = "8px";
          dialog.style.padding = "20px";
          dialog.style.boxShadow = "0 4px 30px rgba(0, 0, 0, 0.1)";
          dialog.style.margin = "0 auto";
          dialog.style.top = "50%";
          dialog.style.left = "50%";
          dialog.style.transform = "translate(-50%, -50%)";
        }
      });
      
      // Also handle any fixed positioned elements
      const fixedElements = document.querySelectorAll('div[style*="position: fixed"]');
      fixedElements.forEach(el => {
        if (el instanceof HTMLElement && !el.classList.contains('identitykit-dialog')) {
          el.style.display = "none";
        }
      });
    }, 100); // Small delay to ensure the elements are rendered
  }, []);

  // Function to hide the NFID UI after connection is complete or failed
  const hideNFIDModal = useCallback(() => {
    // Target all potential NFID UI elements
    const nfidDialogs = document.querySelectorAll(".identitykit-dialog");
    nfidDialogs.forEach(dialog => {
      if (dialog instanceof HTMLElement) {
        dialog.style.display = "none";
      }
    });
    
    // Also handle any fixed positioned elements
    const fixedElements = document.querySelectorAll('div[style*="position: fixed"]');
    fixedElements.forEach(el => {
      if (el instanceof HTMLElement && !el.classList.contains('identitykit-dialog')) {
        el.style.display = "none";
      }
    });
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