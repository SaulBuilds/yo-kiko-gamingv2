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
      /* Hide NFID UI by default */
      .identitykit-dialog {
        display: none;
        position: fixed;
        z-index: 9999;
        max-width: 400px;
        width: 100%;
        background-color: rgba(0, 0, 0, 0.75);
        border-radius: 8px;
        padding: 20px;
        box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
        margin: 0 auto;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }

      /* Apply a data attribute for JS targeting */
      .identitykit-dialog[data-nfid-container] {
        display: none;
      }

      /* Remove any fixed position elements added by NFID */
      div[style*="position: fixed"] {
        display: none !important;
      }
    `;
    
    // Add the style to the document head
    document.head.appendChild(styleElement);
    
    // Clean up function
    return () => {
      document.head.removeChild(styleElement);
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