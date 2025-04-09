import { ReactNode, useEffect } from 'react';
import { IdentityKitProvider, IdentityKitTheme } from '@nfid/identitykit/react';

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
  // Just add minimal styling to make NFID components work in our app
  useEffect(() => {
    // Create a style element to contain our custom CSS
    const styleElement = document.createElement('style');
    styleElement.innerHTML = `
      /* Minimal styling to ensure NFID components look good */
      .identitykit-dialog button {
        border-radius: 6px !important;
        transition: all 0.2s ease !important;
      }
      
      /* Override any scrollbar modifications */
      html, body {
        overflow: auto !important;
        height: auto !important;
      }
    `;
    
    // Add the style to the document head
    document.head.appendChild(styleElement);
    
    // Expose simple global methods for compatibility with our hooks
    // These don't actually do anything now since we're using the MutationObserver
    // approach in the modal component
    window.showNFIDDialog = () => {
      console.log("NFID dialog visibility is now handled in the modal component");
    };

    window.hideNFIDDialog = () => {
      console.log("NFID dialog visibility is now handled in the modal component");
    };
    
    // Clean up function
    return () => {
      document.head.removeChild(styleElement);
      // Remove global methods
      window.showNFIDDialog = undefined as any;
      window.hideNFIDDialog = undefined as any;
    };
  }, []);

  return (
    <IdentityKitProvider
      // Set to false to disable the featured signer UI which can appear at the bottom of the page
      // (we'll handle it manually in our modal component)
      featuredSigner={false}
      // Specify the theme to match our app's design
      theme={IdentityKitTheme.DARK}
    >
      {children}
    </IdentityKitProvider>
  );
}

// Add the global method types to the Window interface
declare global {
  interface Window {
    showNFIDDialog: () => void;
    hideNFIDDialog: () => void;
  }
}