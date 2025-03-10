import { useState } from 'react';
import {
  useAccount,
  useConnect,
  useDisconnect,
} from 'wagmi';
import { mainnet, sepolia, arbitrum, optimism, base } from 'wagmi/chains';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Wallet, ArrowRight, Power } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const chains = [
  { ...mainnet, name: 'Ethereum' },
  { ...arbitrum, name: 'Arbitrum' },
  { ...optimism, name: 'Optimism' },
  { ...base, name: 'Base' },
  { ...sepolia, name: 'Sepolia (Testnet)' },
];

export function WalletConnect() {
  const [open, setOpen] = useState(false);
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { toast } = useToast();

  if (isConnected) {
    return (
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          className="font-mono"
        >
          {address?.slice(0, 6)}...{address?.slice(-4)}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => disconnect()}
          className="text-destructive"
        >
          <Power className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={isPending}>
          <Wallet className="mr-2 h-4 w-4" />
          Connect Wallet
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect Wallet</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-2">
            {connectors.map((connector) => (
              <Card
                key={connector.uid}
                className="cursor-pointer transition-colors hover:bg-accent"
                onClick={() => {
                  connect({ connector })
                    .catch((error) => {
                      toast({
                        title: "Connection failed",
                        description: error.message,
                        variant: "destructive",
                      });
                    });
                  setOpen(false);
                }}
              >
                <CardHeader className="p-4">
                  <CardTitle className="text-sm font-medium flex items-center justify-between">
                    {connector.name}
                    <ArrowRight className="h-4 w-4" />
                  </CardTitle>
                  <CardDescription>
                    {connector.type === 'injected'
                      ? 'Connect to your browser wallet'
                      : connector.type === 'walletConnect'
                      ? 'Scan with your wallet app'
                      : 'Install MetaMask'}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}