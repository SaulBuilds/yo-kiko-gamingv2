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
  // Add custom styles to the NFID UI elements and continuously monitor for any new elements
  useEffect(() => {
    // Create a style element to contain our custom CSS
    const styleElement = document.createElement('style');
    styleElement.innerHTML = `
      /* ABSOLUTE HIDING for NFID's bottom bar */
      html body > div:last-child:not(.identitykit-dialog) > div:last-child > div > div {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        height: 0 !important;
        max-height: 0 !important;
        overflow: hidden !important;
        pointer-events: none !important;
        position: absolute !important;
        top: -9999px !important;
        left: -9999px !important;
      }
      
      /* First, hide everything position:fixed by default */
      div[style*="position: fixed"]:not(.modal-wrapper):not(.dialog-content) {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
      }
      
      /* Only show main dialog when triggered by our button */
      .identitykit-dialog.show-nfid-dialog {
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
        pointer-events: auto !important;
        position: fixed !important;
        z-index: 9999 !important; 
        max-width: 450px !important;
        width: 95% !important;
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

      /* Target ALL bottom fixed elements using multiple selectors */
      body > div[style*="position: fixed"][style*="bottom"],
      div[style*="position: fixed"][style*="bottom"],
      div[data-theme="dark"][style*="bottom"],
      div[data-theme="dark"][style*="position: fixed"],
      div[style*="bottom: 0px"],
      div[style*="bottom: 0"] {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
        height: 0 !important;
        max-height: 0 !important;
        overflow: hidden !important;
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
      // Target all dialogs
      document.querySelectorAll('.identitykit-dialog').forEach(dialog => {
        dialog.classList.add('show-nfid-dialog');
      });
      
      // Function to aggressively remove any bottom elements
      const hideBottomElements = () => {
        // Use multiple selectors to target the bottom elements
        const selectors = [
          'div[style*="position: fixed"][style*="bottom"]',
          'div[style*="bottom: 0"]',
          'body > div > div > div[style*="position"]'
        ];
        
        selectors.forEach(selector => {
          document.querySelectorAll(selector).forEach(el => {
            // Apply hiding styles directly
            if (el instanceof HTMLElement) {
              el.style.display = 'none';
              el.style.visibility = 'hidden';
              el.style.opacity = '0';
              el.style.height = '0';
              el.style.maxHeight = '0';
              el.style.overflow = 'hidden';
              el.style.pointerEvents = 'none';
            }
          });
        });
      };
      
      // Execute initial hiding
      hideBottomElements();
      
      // Set up an interval to continuously hide elements
      // This handles dynamically added elements
      const intervalId = window.setInterval(hideBottomElements, 100);
      
      // Store the interval ID on the window so we can clear it later
      (window as any)._nfidHideInterval = intervalId;
    };

    window.hideNFIDDialog = () => {
      // Hide all dialogs
      document.querySelectorAll('.identitykit-dialog').forEach(dialog => {
        dialog.classList.remove('show-nfid-dialog');
      });
      
      // Clear the interval if it exists
      if ((window as any)._nfidHideInterval) {
        window.clearInterval((window as any)._nfidHideInterval);
        (window as any)._nfidHideInterval = null;
      }
    };
    
    // Function to periodically clean up bottom UI elements
    const cleanupInterval = setInterval(() => {
      const bottomElements = document.querySelectorAll('div[style*="position: fixed"][style*="bottom"], div[style*="bottom: 0"]');
      bottomElements.forEach(el => {
        if (el instanceof HTMLElement) {
          el.style.display = 'none';
          el.style.visibility = 'hidden';
          el.style.opacity = '0';
          el.style.height = '0';
          el.style.maxHeight = '0';
          el.style.overflow = 'hidden';
        }
      });
    }, 1000);
    
    // Hide the dialog initially
    window.hideNFIDDialog();
    
    // Clean up function
    return () => {
      document.head.removeChild(styleElement);
      clearInterval(cleanupInterval);
      // Clean up interval if it exists
      if ((window as any)._nfidHideInterval) {
        window.clearInterval((window as any)._nfidHideInterval);
      }
      // Remove global methods
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