import { useAccount, useDisconnect } from 'wagmi';
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";
import { WalletModal, useWalletStore } from './wallet-modal';

export function WalletConnect() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { setOpen } = useWalletStore();

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <div className="font-mono">
          {address.slice(0, 6)}...{address.slice(-4)}
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
    <>
      <Button 
        onClick={() => setOpen(true)}
        className="gap-2"
      >
        <Wallet className="h-4 w-4" />
        Connect Wallet
      </Button>
      <WalletModal />
    </>
  );
}