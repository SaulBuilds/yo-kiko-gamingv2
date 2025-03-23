import { useLoginWithAbstract, useGlobalWalletSignerAccount } from "@abstract-foundation/agw-react";
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";

export function ConnectWallet() {
  const { login, logout } = useLoginWithAbstract();
  const { address, isConnected } = useGlobalWalletSignerAccount();

  const shortenAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (isConnected && address) {
    return (
      <Button 
        onClick={logout}
        className="pixel-font flex items-center gap-2"
        variant="outline"
      >
        <Wallet className="w-4 h-4" />
        Connected with Abstract ({shortenAddress(address)})
      </Button>
    );
  }

  return (
    <Button 
      onClick={login}
      className="pixel-font flex items-center gap-2"
      variant="default"
    >
      <Wallet className="w-4 h-4" />
      Connect with Abstract
    </Button>
  );
}