import { ReactNode } from 'react';
import { 
  IdentityKitProvider, 
  IdentityKitTheme, 
  IdentityKitAuthType
} from '@nfid/identitykit/react';

interface NFIDProviderProps {
  children: ReactNode;
}

/**
 * NFID Identity Kit Provider
 * Sets up the Internet Computer ICP authentication context
 * 
 * This implementation configures the NFID Identity Kit with the proper
 * target canisters for delegation following the official documentation.
 * 
 * @param {NFIDProviderProps} props - The provider props
 * @returns {JSX.Element} - The wrapped component with NFID context
 */
export function NFIDProvider({ children }: NFIDProviderProps) {
  return (
    <IdentityKitProvider
      // Set auth type to delegation
      authType={IdentityKitAuthType.DELEGATION}
      
      // Configure the signers with target canisters
      // In a production app, add specific backend canister IDs
      signerClientOptions={{
        targets: ["yo-kiko-backend-canister-id"] // Replace with actual canister IDs
      }}
      
      // Configure the theme to match our application
      theme={IdentityKitTheme.DARK}
      
      // Disable the featured signer UI to show all options equally
      featuredSigner={false}
      
      // Optional callbacks for connection events
      onConnectSuccess={() => {
        console.log("NFID connection successful");
      }}
      onConnectFailure={(error: Error) => {
        console.error("NFID connection failed:", error);
      }}
      onDisconnect={() => {
        console.log("NFID disconnected");
      }}
    >
      {children}
    </IdentityKitProvider>
  );
}