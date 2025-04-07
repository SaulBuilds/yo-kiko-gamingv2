import { useLoginWithAbstract, useGlobalWalletSignerAccount } from "@abstract-foundation/agw-react";
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";
import { useState } from "react";
import { WalletSelectModal } from "@/components/wallet/wallet-select-modal";
import { useMultiWallet } from "@/hooks/use-multi-wallet";

/**
 * ConnectWallet component that provides a unified interface for connecting to
 * multiple wallet types (Abstract and NFID/ICP)
 * 
 * @returns {JSX.Element} - The rendered component
 */
export function ConnectWallet() {
  const { login: rawAbstractLogin, logout: abstractLogout } = useLoginWithAbstract();
  const { address: abstractAddress } = useGlobalWalletSignerAccount();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Wrap the Abstract login function to return a Promise
  const abstractLogin = async (): Promise<void> => {
    rawAbstractLogin();
    return Promise.resolve();
  };
  
  const {
    isConnected,
    walletAddress,
    disconnect,
    activeWalletType,
    isAbstractConnecting
  } = useMultiWallet();

  const shortenAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const handleDisconnect = async () => {
    // If using NFID, use the disconnect from useMultiWallet
    // If using Abstract directly, use abstractLogout
    if (activeWalletType === 'nfid') {
      await disconnect();
    } else {
      await abstractLogout();
    }
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = async (): Promise<void> => {
    setIsModalOpen(false);
    return Promise.resolve();
  };

  // Show wallet selection modal
  return (
    <>
      {isConnected && walletAddress ? (
        <Button 
          onClick={handleDisconnect}
          className="pixel-font flex items-center gap-2"
          variant="outline"
        >
          <Wallet className="w-4 h-4" />
          Connected with {activeWalletType === 'nfid' ? 'NFID' : 'Abstract'} ({shortenAddress(walletAddress)})
        </Button>
      ) : (
        <Button 
          onClick={handleOpenModal}
          className="pixel-font flex items-center gap-2"
          variant="default"
        >
          <Wallet className="w-4 h-4" />
          Connect Wallet
        </Button>
      )}

      <WalletSelectModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        useAbstractWalletConnect={abstractLogin}
        isAbstractConnecting={isAbstractConnecting}
      />
    </>
  );
}