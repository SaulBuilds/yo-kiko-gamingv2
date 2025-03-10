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
import { Wallet, ArrowRight } from "lucide-react";
import { useConnect } from "wagmi";
import { create } from "zustand";
import { useToast } from "@/hooks/use-toast";

interface WalletStore {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
}

export const useWalletStore = create<WalletStore>((set) => ({
  isOpen: false,
  setOpen: (open) => set({ isOpen: open }),
}));

export function WalletModal() {
  const { isOpen, setOpen } = useWalletStore();
  const { connect, connectors, isLoading, error } = useConnect();
  const { toast } = useToast();

  const walletOptions = [
    {
      name: "Browser Wallet",
      description: "Connect using MetaMask or other browser wallets",
      icon: "🦊",
      onClick: () => {
        const connector = connectors.find((c) => c.id === "metaMask");
        if (connector) {
          connect({ connector })
            .then(() => {
              setOpen(false);
              toast({
                title: "Connected",
                description: "Successfully connected to MetaMask",
              });
            })
            .catch((error: Error) => {
              toast({
                title: "Connection failed",
                description: error.message,
                variant: "destructive",
              });
            });
        }
      },
      installUrl: "https://metamask.io/download/",
    },
    {
      name: "WalletConnect",
      description: "Scan with your favorite mobile wallet",
      icon: "📱",
      onClick: () => {
        const connector = connectors.find((c) => c.id === "walletConnect");
        if (connector) {
          connect({ connector })
            .then(() => {
              setOpen(false);
              toast({
                title: "Connected",
                description: "Successfully connected via WalletConnect",
              });
            })
            .catch((error: Error) => {
              toast({
                title: "Connection failed",
                description: error.message,
                variant: "destructive",
              });
            });
        }
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
          <DialogTitle>Connect Your Wallet</DialogTitle>
          <DialogDescription>
            Choose how you want to connect. If you don't have a wallet yet, you can select a provider and create one.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4 pb-4">
            {walletOptions.map((option) => (
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
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </Card>
            ))}
          </div>
          <div className="border-t pt-4">
            <h4 className="font-semibold mb-2">New to Web3?</h4>
            <p className="text-sm text-muted-foreground mb-4">
              If you're new to blockchain technology and don't have a wallet yet, we recommend starting with MetaMask:
            </p>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.open("https://metamask.io/download/", "_blank")}
            >
              Install MetaMask
            </Button>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}