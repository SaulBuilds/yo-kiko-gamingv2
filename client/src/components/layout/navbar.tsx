import { useLocation } from "wouter";
import { WalletConnect } from "@/components/wallet/wallet-connect";

export function Navbar() {
  const [_, setLocation] = useLocation();

  return (
    <nav className="border-b bg-card">
      <div className="container mx-auto px-4">
        <div className="h-16 flex items-center justify-between">
          <div 
            className="flex items-center space-x-4 cursor-pointer" 
            onClick={() => setLocation("/")}
          >
            <h1 className="pixel-font text-xl text-primary">sumthn.fun</h1>
          </div>

          <div className="flex items-center space-x-4">
            <WalletConnect />
          </div>
        </div>
      </div>
    </nav>
  );
}