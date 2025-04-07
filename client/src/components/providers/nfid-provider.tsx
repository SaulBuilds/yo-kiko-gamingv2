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
      /* Hide ALL NFID UI elements by default - more aggressive approach */
      h2:contains("Select signer"), 
      h3:contains("Select signer"),
      div:has(> h2:contains("Select signer")),
      div:has(> h3:contains("Select signer")),
      div:has(> div > h2:contains("Select signer")),
      div:has(> div > h3:contains("Select signer")) {
        display: none !important;
      }

      /* Target wallet selection headings */
      div:has(> img[src*="NFID"]),
      div:has(> img[src*="Identity"]) {
        display: none !important;
      }

      /* Target by content */
      div:contains("Connect your wallet") {
        display: none !important;
      }

      /* Make this even more aggressive - hide everything at the bottom after the real content */
      body > div:nth-last-child(-n+3) {
        display: none !important;
      }

      /* Only show when explicitly set */
      .nfid-modal-visible {
        display: block !important;
        position: fixed !important;
        z-index: 9999 !important;
        top: 50% !important;
        left: 50% !important;
        transform: translate(-50%, -50%) !important;
        max-width: 400px !important;
        width: 100% !important;
        background-color: rgba(0, 0, 0, 0.85) !important;
        border-radius: 8px !important;
        padding: 20px !important;
        box-shadow: 0 4px 30px rgba(0, 0, 0, 0.3) !important;
      }
    `;
    
    // Add the style to the document head
    document.head.appendChild(styleElement);

    // Create a mutation observer to hide new NFID elements that might get added to the DOM
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach(node => {
            if (node instanceof HTMLElement) {
              // Check if this is likely an NFID element (look for telltale signs)
              if (
                (node.innerText && node.innerText.includes('Select signer')) ||
                (node.innerText && node.innerText.includes('Connect your wallet')) ||
                (node.innerHTML && node.innerHTML.includes('NFID Wallet')) ||
                (node.innerHTML && node.innerHTML.includes('Internet Identity'))
              ) {
                // Hide it unless it's explicitly marked as visible
                if (!node.classList.contains('nfid-modal-visible')) {
                  node.style.display = 'none';
                }
              }
            }
          });
        }
      });
    });

    // Start observing the document body for added nodes
    observer.observe(document.body, { childList: true, subtree: true });
    
    // Clean up function
    return () => {
      document.head.removeChild(styleElement);
      observer.disconnect();
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