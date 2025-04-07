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
    // Find ALL possible NFID elements using a more aggressive approach
    setTimeout(() => {
      // Method 1: Find elements by text content
      const findElementsByText = (text: string) => {
        const elements: HTMLElement[] = [];
        const walker = document.createTreeWalker(
          document.body,
          NodeFilter.SHOW_ELEMENT,
          {
            acceptNode: (node) => {
              if (node instanceof HTMLElement) {
                if (node.innerText && node.innerText.includes(text)) {
                  return NodeFilter.FILTER_ACCEPT;
                }
              }
              return NodeFilter.FILTER_SKIP;
            }
          }
        );
        
        let currentNode: Node | null;
        while (currentNode = walker.nextNode()) {
          if (currentNode instanceof HTMLElement) {
            elements.push(currentNode);
          }
        }
        
        return elements;
      };
      
      // Find all potential NFID elements
      const signerElements = findElementsByText('Select signer');
      const walletElements = findElementsByText('Connect your wallet');
      const nfidElements = findElementsByText('NFID Wallet');
      const identityElements = findElementsByText('Internet Identity');
      
      // Combine all elements
      const allElements = [
        ...signerElements,
        ...walletElements,
        ...nfidElements,
        ...identityElements
      ];
      
      // Get parent elements to capture the whole modal
      const parentElements: HTMLElement[] = [];
      allElements.forEach(el => {
        let parent = el.parentElement;
        while (parent) {
          // Add parent to our list if it's not already included
          if (parent instanceof HTMLElement && !parentElements.includes(parent)) {
            parentElements.push(parent);
          }
          parent = parent.parentElement;
          
          // Limit to 3 levels up to avoid affecting too much of the DOM
          if (parentElements.length > 3) break;
        }
      });
      
      // Show all potential parent elements by marking them as explicitly visible
      const allTargetElements = [...allElements, ...parentElements];
      allTargetElements.forEach(el => {
        if (el instanceof HTMLElement) {
          el.classList.add('nfid-modal-visible');
          // Remove any inline display: none
          el.style.removeProperty('display');
        }
      });
    }, 200); // Increase delay to ensure elements are rendered
  }, []);

  // Function to hide the NFID UI after connection is complete or failed
  const hideNFIDModal = useCallback(() => {
    // Remove the visible class from any elements that have it
    const visibleElements = document.querySelectorAll('.nfid-modal-visible');
    visibleElements.forEach(el => {
      if (el instanceof HTMLElement) {
        el.classList.remove('nfid-modal-visible');
        el.style.display = 'none';
      }
    });
    
    // Also hide any elements that might be related to NFID
    const potentialNFIDElements = document.querySelectorAll('div:has(h2), div:has(h3)');
    potentialNFIDElements.forEach(el => {
      if (el instanceof HTMLElement) {
        const textContent = el.innerText || '';
        if (
          textContent.includes('Select signer') ||
          textContent.includes('Connect your wallet') ||
          textContent.includes('NFID Wallet') ||
          textContent.includes('Internet Identity')
        ) {
          el.style.display = 'none';
        }
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