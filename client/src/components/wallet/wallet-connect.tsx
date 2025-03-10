import { useState } from 'react';
import {
  useAccount,
  useConnect,
  useDisconnect,
} from 'wagmi';
import { Button } from "@/components/ui/button";
import { useToast } from '@/hooks/use-toast';

export function WalletConnect() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { toast } = useToast();

  if (isConnected) {
    return (
      <div className="flex items-center gap-2">
        <div className="font-mono">
          {address?.slice(0, 6)}...{address?.slice(-4)}
        </div>
        <Button 
          variant="ghost" 
          onClick={() => disconnect()}
        >
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {connectors.map((connector) => (
        <Button
          key={connector.id}
          onClick={() => {
            connect({ connector })
              .then(() => {
                toast({
                  title: "Connected",
                  description: "Wallet connected successfully",
                });
              })
              .catch((error: Error) => {
                toast({
                  title: "Connection failed",
                  description: error.message,
                  variant: "destructive",
                });
              });
          }}
          disabled={!connector.ready}
        >
          Connect with {connector.name}
        </Button>
      ))}
    </div>
  );
}