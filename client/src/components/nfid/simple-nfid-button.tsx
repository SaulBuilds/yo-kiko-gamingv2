import { useState } from 'react';
import { useIdentityKit } from '@nfid/identitykit/react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

interface SimpleNFIDButtonProps {
  className?: string;
}

/**
 * SimpleNFIDButton component
 * A simplified button for NFID connection that follows the official approach
 * 
 * This component doesn't try to modify or relocate the NFID UI elements,
 * but instead lets them appear as designed by the NFID team.
 * 
 * @param {SimpleNFIDButtonProps} props - Component props
 * @returns {JSX.Element} The simplified NFID button component
 */
export function SimpleNFIDButton({ className }: SimpleNFIDButtonProps) {
  const nfidIdentityKit = useIdentityKit();
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const isConnected = !!nfidIdentityKit.user;
  
  // Handle connection
  const handleConnection = async () => {
    if (isConnected) {
      try {
        setIsConnecting(true);
        await nfidIdentityKit.disconnect();
        console.log("Disconnected from NFID");
      } catch (err: any) {
        console.error("Error disconnecting from NFID:", err);
        setError(err?.message || "Failed to disconnect");
      } finally {
        setIsConnecting(false);
      }
    } else {
      try {
        setError(null);
        setIsConnecting(true);
        console.log("Connecting to NFID...");
        await nfidIdentityKit.connect();
        console.log("Connected to NFID successfully");
      } catch (err: any) {
        console.error("Error connecting to NFID:", err);
        setError(err?.message || "Failed to connect to NFID");
      } finally {
        setIsConnecting(false);
      }
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
        onClick={handleConnection}
        disabled={isConnecting}
        className={`w-full py-6 relative ${className}`}
        variant={isConnected ? "default" : "outline"}
      >
        {isConnecting ? (
          <Spinner className="mr-2" />
        ) : (
          <img 
            src="/assets/nfid-logo-small.svg" 
            alt="NFID" 
            className="w-6 h-6 mr-2"
          />
        )}
        <div className="flex flex-col items-start">
          <span className="font-semibold">NFID</span>
          <span className="text-xs text-muted-foreground">
            {isConnected 
              ? 'Connected with Internet Computer' 
              : 'Connect with Internet Computer'
            }
          </span>
        </div>
      </Button>
    </div>
  );
}