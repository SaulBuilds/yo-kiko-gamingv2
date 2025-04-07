import { ReactNode, useEffect } from 'react';
import { IdentityKitProvider, IdentityKitTheme } from '@nfid/identitykit/react';

// Extend the Window interface to include our global functions
declare global {
  interface Window {
    showNFIDContainer?: () => void;
    hideNFIDContainer?: () => void;
  }
}

interface NFIDProviderProps {
  children: ReactNode;
}

/**
 * NFID Identity Kit Provider
 * Sets up the Internet Computer ICP authentication context
 * 
 * @param {NFIDProviderProps} props - The provider props
 * @returns {JSX.Element} - The wrapped component with NFID context
 */
export function NFIDProvider({ children }: NFIDProviderProps) {
  useEffect(() => {
    // Expose functions to show/hide NFID container for global access
    window.showNFIDContainer = () => {
      const container = document.getElementById('nfid-container');
      if (container) {
        container.classList.add('visible');
      }
    };
    
    window.hideNFIDContainer = () => {
      const container = document.getElementById('nfid-container');
      if (container) {
        container.classList.remove('visible');
      }
    };
    
    // Create a MutationObserver to detect when the NFID UI is rendered
    const observer = new MutationObserver((mutations) => {
      // Check if any mutations contain NFID-related content
      const hasSigner = mutations.some(mutation => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          return Array.from(mutation.addedNodes).some(node => {
            if (node instanceof HTMLElement) {
              // Use textContent instead of innerText for broader compatibility
              const text = node.textContent || '';
              return (
                text.includes('Select signer') || 
                text.includes('Connect your wallet') || 
                text.includes('NFID Wallet') || 
                text.includes('Internet Identity')
              );
            }
            return false;
          });
        }
        return false;
      });
      
      if (hasSigner) {
        // Force move any NFID elements to our container
        const nfidContainer = document.getElementById('nfid-container');
        if (nfidContainer) {
          document.querySelectorAll('body > div:not(#root):not(#nfid-container)').forEach(el => {
            // Use textContent instead of innerText for broader compatibility
            const text = el.textContent || '';
            if (
              text.includes('Select signer') || 
              text.includes('Connect your wallet') ||
              text.includes('NFID Wallet') ||
              text.includes('Internet Identity')
            ) {
              nfidContainer.appendChild(el);
            }
          });
        }
      }
    });
    
    // Observe the entire document
    observer.observe(document.documentElement, { 
      childList: true, 
      subtree: true,
      characterData: true
    });
    
    return () => {
      observer.disconnect();
      // Clean up global functions
      delete window.showNFIDContainer;
      delete window.hideNFIDContainer;
    };
  }, []);

  return (
    <IdentityKitProvider
      // Set to false to disable the featured signer UI which can appear at the bottom of the page
      featuredSigner={false}
      // Specify the theme to match our app's design
      theme={IdentityKitTheme.DARK}
      // Note: providerUrl is not a valid prop for IdentityKitProvider, removing it
    >
      {children}
    </IdentityKitProvider>
  );
}