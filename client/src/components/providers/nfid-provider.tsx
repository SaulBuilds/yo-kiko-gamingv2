import { ReactNode } from 'react';
import { IdentityKitProvider, IdentityKitTheme } from '@nfid/identitykit/react';

interface NFIDProviderProps {
  children: ReactNode;
}

/**
 * NFID Identity Kit Provider
 * Sets up the Internet Computer ICP authentication context
 * 
 * This is a minimalist implementation that simply provides the
 * NFID Identity Kit context to the application. The UI elements
 * will be handled by the WalletSelectModal component.
 * 
 * @param {NFIDProviderProps} props - The provider props
 * @returns {JSX.Element} - The wrapped component with NFID context
 */
export function NFIDProvider({ children }: NFIDProviderProps) {
  return (
    <IdentityKitProvider
      // Set to false to disable the featured signer UI at the bottom of the page
      // We'll handle the UI positioning in the WalletSelectModal
      featuredSigner={false}
      theme={IdentityKitTheme.DARK}
    >
      {children}
    </IdentityKitProvider>
  );
}