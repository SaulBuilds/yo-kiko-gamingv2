import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

interface AbstractModalButtonProps {
  onConnect: () => Promise<void>;
  isConnecting: boolean;
  onClose?: () => Promise<void>;
  className?: string;
}

/**
 * AbstractModalButton component
 * A button for connecting to Abstract wallet within a modal context
 * 
 * @param {AbstractModalButtonProps} props - Component props
 * @returns {JSX.Element} The Abstract wallet button component
 */
export function AbstractModalButton({ 
  onConnect, 
  isConnecting, 
  onClose, 
  className 
}: AbstractModalButtonProps) {
  const [error, setError] = useState<string | null>(null);

  // Handle Abstract wallet connection
  const handleConnect = async () => {
    try {
      setError(null);
      console.log("Starting Abstract wallet connection...");
      await onConnect();
      
      // Close the modal after successful connection
      if (onClose) {
        await onClose();
      }
    } catch (err: any) {
      console.error("Error connecting to Abstract wallet:", err);
      setError(err?.message || "Failed to connect to Abstract wallet");
    }
  };

  return (
    <div className="w-full">
      {/* Error display */}
      {error && (
        <div className="bg-destructive/20 border border-destructive text-destructive px-4 py-2 rounded-md mb-4">
          {error}
        </div>
      )}
      
      <Button 
        onClick={handleConnect}
        disabled={isConnecting}
        className={`w-full py-6 relative ${className}`}
        variant="outline"
      >
        {isConnecting ? (
          <Spinner className="mr-2" />
        ) : (
          <img 
            src="/assets/abstract-logo.svg" 
            alt="Abstract Wallet" 
            className="w-6 h-6 mr-2"
          />
        )}
        <div className="flex flex-col items-start">
          <span className="font-semibold">Abstract Wallet</span>
          <span className="text-xs text-muted-foreground">Connect with your EVM wallet</span>
        </div>
      </Button>
    </div>
  );
}