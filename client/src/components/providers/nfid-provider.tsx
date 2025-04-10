import { ReactNode } from 'react';
import { 
  IdentityKitProvider, 
  IdentityKitTheme
} from '@nfid/identitykit/react';

interface NFIDProviderProps {
  children: ReactNode;
}

/**
 * NFID Identity Kit Provider
 * Sets up the Internet Computer ICP authentication context
 * 
 * This implementation configures the NFID Identity Kit with the proper
 * target canisters for delegation.
 * 
 * @param {NFIDProviderProps} props - The provider props
 * @returns {JSX.Element} - The wrapped component with NFID context
 */
export function NFIDProvider({ children }: NFIDProviderProps) {
  return (
    <IdentityKitProvider
      // Configure the signers with target canisters
      // Note: In a production app, you would add your specific backend canister IDs here
      signerClientOptions={{
        targets: ["yo-kiko-backend-canister-id"] // Replace with actual canister IDs
      }}
      
      // Configure the theme to match our application
      theme={IdentityKitTheme.DARK}
      
      // Disable the featured signer UI - we'll use our own UI
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