import { useNFID } from '@/hooks/use-nfid';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

interface NFIDConnectButtonProps {
  className?: string;
}

/**
 * NFIDConnectButton component
 * A button for connecting to NFID directly (without moving UI elements)
 * This is a simpler version that doesn't handle UI relocation
 * 
 * @param {NFIDConnectButtonProps} props - Component props
 * @returns {JSX.Element} The NFID connect button component
 */
export function NFIDConnectButton({ className }: NFIDConnectButtonProps) {
  const { isConnecting, connect, isConnected, disconnect } = useNFID();

  const handleClick = async () => {
    if (isConnected) {
      await disconnect();
    } else {
      await connect();
    }
  };

  return (
    <Button 
      onClick={handleClick}
      disabled={isConnecting}
      className={`w-full py-6 relative ${className}`}
      variant={isConnected ? "default" : "outline"}
    >
      {isConnecting ? (
        <Spinner className="mr-2" />
      ) : (
        <img 
          src="/assets/nfid-logo.svg" 
          alt="NFID" 
          className="w-6 h-6 mr-2"
        />
      )}
      <div className="flex flex-col items-start">
        <span className="font-semibold">NFID</span>
        <span className="text-xs text-muted-foreground">
          {isConnected ? 'Connected' : 'Connect with Internet Computer'}
        </span>
      </div>
    </Button>
  );
}