import { useState } from 'react';
import { useAuth as useNfidAuth } from '@nfid/identitykit/react';
import { ConnectWallet } from '@nfid/identitykit/react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

interface NFIDAuthButtonProps {
  className?: string;
  size?: 'default' | 'sm' | 'lg';
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  compact?: boolean;
}

/**
 * NFIDAuthButton component
 * Provides a button for authenticating with NFID (Internet Computer Protocol)
 * 
 * This component uses the built-in ConnectWallet component from NFID Identity Kit
 * but with customized styling to match our application.
 * 
 * @param {NFIDAuthButtonProps} props - Component props
 * @returns {JSX.Element} The NFID authentication button
 */
export function NFIDAuthButton({ 
  className, 
  size = 'default',
  variant = 'default',
  compact = false
}: NFIDAuthButtonProps) {
  const { isConnecting } = useNfidAuth();
  const [useCustomButton, setUseCustomButton] = useState(false);

  // If we run into any issues with the NFID ConnectWallet component,
  // we can fall back to using our custom button implementation
  if (useCustomButton) {
    return (
      <Button
        className={className}
        size={size}
        variant={variant}
        onClick={() => {
          try {
            const { connect } = useNfidAuth();
            connect();
          } catch (error) {
            console.error('Error connecting to NFID:', error);
          }
        }}
        disabled={isConnecting}
      >
        {isConnecting ? (
          <Spinner className="mr-2" />
        ) : (
          <img 
            src="/assets/nfid-logo.svg" 
            alt="NFID" 
            className="w-5 h-5 mr-2"
          />
        )}
        {compact ? 'NFID' : 'Connect with NFID'}
      </Button>
    );
  }

  // Use the built-in ConnectWallet component from NFID Identity Kit
  // which handles the connection flow and UI automatically
  return (
    <ConnectWallet />
  );
}