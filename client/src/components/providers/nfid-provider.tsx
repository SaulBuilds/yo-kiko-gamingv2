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
  // Add custom styles to the NFID UI elements after they're rendered
  useEffect(() => {
    // Create a style element to contain our custom CSS
    const styleElement = document.createElement('style');
    styleElement.innerHTML = `
      /* Style NFID UI containers for better integration */
      .identitykit-dialog {
        display: block !important;
        position: fixed !important;
        z-index: 9999 !important; 
        max-width: 450px !important;
        width: 100% !important;
        background-color: rgba(18, 18, 18, 0.95) !important;
        border-radius: 12px !important;
        padding: 20px !important;
        box-shadow: 0 4px 30px rgba(0, 0, 0, 0.3) !important;
        top: 50% !important;
        left: 50% !important;
        transform: translate(-50%, -50%) !important;
        font-family: system-ui, -apple-system, sans-serif !important;
        border: 1px solid rgba(255, 255, 255, 0.1) !important;
        max-height: 90vh !important;
        overflow-y: auto !important;
      }

      /* Only show main dialog when triggered by our button */
      body > div > .identitykit-dialog:not(.show-nfid-dialog) {
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
      }

      /* Style the buttons inside the dialog */
      .identitykit-dialog button {
        border-radius: 6px !important;
        padding: 10px 16px !important;
        transition: all 0.2s ease !important;
      }

      /* Contained scrolling for the dialog */
      .identitykit-dialog > div {
        max-height: 100% !important;
        overflow: hidden !important;
      }

      /* Style the backdrop */
      .identitykit-backdrop {
        background-color: rgba(0, 0, 0, 0.7) !important;
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        z-index: 9998 !important;
      }

      /* Hide any unwanted NFID elements that appear at the bottom */
      body > div[style*="position: fixed"][style*="bottom: 0"],
      div[style*="position: fixed"]:not(.identitykit-dialog):not(.identitykit-backdrop) {
        display: none !important;
      }

      /* Override any scrollbar modifications */
      html, body {
        overflow: auto !important;
        height: auto !important;
      }
    `;
    
    // Add the style to the document head
    document.head.appendChild(styleElement);
    
    // Expose a global method to show/hide the NFID dialog
    window.showNFIDDialog = () => {
      const dialogs = document.querySelectorAll('.identitykit-dialog');
      dialogs.forEach(dialog => {
        dialog.classList.add('show-nfid-dialog');
      });
    };

    window.hideNFIDDialog = () => {
      const dialogs = document.querySelectorAll('.identitykit-dialog');
      dialogs.forEach(dialog => {
        dialog.classList.remove('show-nfid-dialog');
      });
    };
    
    // Hide the dialog initially
    window.hideNFIDDialog();
    
    // Clean up function
    return () => {
      document.head.removeChild(styleElement);
      // Remove global methods by setting them to undefined
      window.showNFIDDialog = undefined as any;
      window.hideNFIDDialog = undefined as any;
    };
  }, []);

  return (
    <IdentityKitProvider
      // Set to false to disable the featured signer UI which can appear at the bottom of the page
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