import { useLocation } from "wouter";
import { ConnectWallet } from "@/components/connect-wallet";
import { Image } from "@/components/ui/image";

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
            <Image 
              src="/assets/yo-kiko_lettermark.svg" 
              alt="Yo-Kiko"
              className="h-8 w-auto"
            />
          </div>

          <div className="flex items-center space-x-4">
            <ConnectWallet />
          </div>
        </div>
      </div>
    </nav>
  );
}