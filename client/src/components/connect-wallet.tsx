import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";
import { useMultiWallet } from "@/hooks/use-multi-wallet";
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
  
  const { 
    isConnected,
    walletAddress,
    activeWalletType,
    disconnect,
    connectAbstract,
    isAbstractConnecting
  } = useMultiWallet();

  // Handle the Abstract login with our multi-wallet hook
  const handleAbstractLogin = async (): Promise<void> => {
    try {
      console.log("Starting Abstract login from ConnectWallet component...");
      await connectAbstract();
      return Promise.resolve();
    } catch (error) {
      console.error("Abstract login error:", error);
      return Promise.reject(error);
    }
  };

  // Handle wallet disconnection
  const handleDisconnect = async () => {
    await disconnect();
  };

  // Open the wallet selection modal
  const handleOpenModal = () => {
    console.log("Opening wallet selection modal");
    setIsModalOpen(true);
  };

  // Close the wallet selection modal
  const handleCloseModal = async (): Promise<void> => {
    console.log("Closing wallet selection modal");
    setIsModalOpen(false);
    return Promise.resolve();
  };

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
        useAbstractWalletConnect={handleAbstractLogin}
        isAbstractConnecting={isAbstractConnecting}
      />
    </>
  );
}