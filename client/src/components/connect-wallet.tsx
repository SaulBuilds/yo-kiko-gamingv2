import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";
import { useMultiWallet } from "@/hooks/use-multi-wallet";
import { useLoginWithAbstract } from "@abstract-foundation/agw-react";
import { WalletSelectModal } from "./wallet/wallet-select-modal";

/**
 * Shortens a wallet address for display purposes
 * 
 * @param {string} address - The wallet address to shorten
 * @returns {string} - The shortened address
 */
function shortenAddress(address: string): string {
  if (!address) return "";
  if (address.length < 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * ConnectWallet component that provides a unified interface for connecting to
 * multiple wallet types (Abstract and NFID/ICP)
 * 
 * @returns {JSX.Element} - The rendered component
 */
export function ConnectWallet() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { login: rawAbstractLogin, logout: abstractLogout } = useLoginWithAbstract();
  const { 
    isConnected,
    walletAddress,
    activeWalletType,
    disconnect,
    isAbstractConnecting
  } = useMultiWallet();

  // Wrap the Abstract login function to return a Promise
  const abstractLogin = async (): Promise<void> => {
    try {
      console.log("Starting Abstract login from ConnectWallet component...");
      rawAbstractLogin();
      return Promise.resolve();
    } catch (error) {
      console.error("Abstract login error:", error);
      return Promise.reject(error);
    }
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
    console.log("Opening wallet modal from ConnectWallet component");
    setIsModalOpen(true);
  };

  const handleCloseModal = async (): Promise<void> => {
    console.log("Closing wallet modal from ConnectWallet component");
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
          Connect to Play
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