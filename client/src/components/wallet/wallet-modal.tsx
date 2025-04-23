import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Wallet, ArrowRight, ArrowLeft } from "lucide-react";
import { useConnect } from "wagmi";
import { create } from "zustand";
import { useToast } from "@/hooks/use-toast";

interface WalletStore {
  isOpen: boolean;
  view: 'main' | 'browser';
  setOpen: (open: boolean) => void;
  setView: (view: 'main' | 'browser') => void;
}

export const useWalletStore = create<WalletStore>((set) => ({
  isOpen: false,
  view: 'main',
  setOpen: (open) => set({ isOpen: open }),
  setView: (view) => set({ view }),
}));

export function WalletModal() {
  const { isOpen, view, setOpen, setView } = useWalletStore();
  const { connect, connectors, error } = useConnect();
  const { toast } = useToast();

  const browserWallets = connectors.filter(
    (c) => c.type === 'injected' || c.id === 'metaMask'
  );

  const handleConnect = (connector: typeof connectors[0]) => {
    connect({ connector })
      .then(() => {
        setOpen(false);
        toast({
          title: "Connected",
          description: `Successfully connected to ${connector.name}`,
        });
      })
      .catch((error: Error) => {
        toast({
          title: "Connection failed",
          description: error.message,
          variant: "destructive",
        });
      });
  };

  const mainOptions = [
    {
      name: "Browser Wallet",
      description: "MetaMask, Coinbase Wallet, or other browser wallets",
      icon: "🦊",
      onClick: () => setView('browser'),
      showArrow: true,
    },
    {
      name: "WalletConnect",
      description: "Connect using your mobile wallet",
      icon: "📱",
      onClick: () => {
        const connector = connectors.find((c) => c.id === "walletConnect");
        if (connector) handleConnect(connector);
      },
    },
    {
      name: "Google Login",
      description: "Sign in with your Google account (Coming Soon)",
      icon: "🔑",
      onClick: () => {
        toast({
          title: "Coming Soon",
          description: "Google login will be available soon!",
        });
      },
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {view === 'browser' && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute left-4 top-4"
                onClick={() => setView('main')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            )}
            {view === 'main' ? 'Connect Your Wallet' : 'Browser Wallets'}
          </DialogTitle>
          <DialogDescription>
            {view === 'main'
              ? "Choose how you want to connect. If you don't have a wallet yet, you can select a provider and create one."
              : "Select from available browser wallets. Install MetaMask or another wallet if none are detected."}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4 pb-4">
            {view === 'main' ? (
              mainOptions.map((option) => (
                <Card
                  key={option.name}
                  className="p-4 cursor-pointer hover:bg-accent transition-colors"
                  onClick={option.onClick}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{option.icon}</div>
                      <div>
                        <h3 className="font-semibold">{option.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {option.description}
                        </p>
                      </div>
                    </div>
                    {option.showArrow && <ArrowRight className="h-5 w-5 text-muted-foreground" />}
                  </div>
                </Card>
              ))
            ) : (
              browserWallets.length > 0 ? (
                browserWallets.map((connector) => (
                  <Card
                    key={connector.uid}
                    className="p-4 cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => handleConnect(connector)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">
                          {connector.id === 'metaMask' ? '🦊' : '🔌'}
                        </div>
                        <div>
                          <h3 className="font-semibold">{connector.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {connector.ready
                              ? "Click to connect"
                              : `Install ${connector.name}`}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground mb-4">
                    No browser wallets detected. We recommend installing MetaMask:
                  </p>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => window.open("https://metamask.io/download/", "_blank")}
                  >
                    <Wallet className="h-4 w-4 mr-2" />
                    Install MetaMask
                  </Button>
                </div>
              )
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}