import { useAccount, useDisconnect } from 'wagmi';
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";
import { WalletModal, useWalletStore } from './wallet-modal';
import { useAuth } from '@/hooks/use-auth';
import { queryClient } from '@/lib/queryClient';

export function WalletConnect() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { setOpen } = useWalletStore();

  const handleDisconnect = async () => {
    await disconnect();
    // Clear user data from cache
    queryClient.setQueryData(["/api/user", address], null);
    queryClient.removeQueries({ queryKey: ["/api/user", address] });
  };

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <div className="font-mono text-sm">
          {address.slice(0, 6)}...{address.slice(-4)}
        </div>
        <Button 
          variant="ghost" 
          onClick={handleDisconnect}
          className="pixel-font text-sm"
        >
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <>
      <Button 
        onClick={() => setOpen(true)}
        className="gap-2 pixel-font text-sm"
      >
        <Wallet className="h-4 w-4" />
        Connect Wallet
      </Button>
      <WalletModal />
    </>
  );
}