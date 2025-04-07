import { AbstractWalletProvider } from "@abstract-foundation/agw-react";
import { abstractTestnet } from "viem/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/hooks/use-auth";
import { Toaster } from "@/components/ui/toaster";
import { NFIDProvider } from "@/components/providers/nfid-provider";

const queryClient = new QueryClient();

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <AbstractWalletProvider 
        chain={abstractTestnet} // Use abstract for mainnet
      >
        <NFIDProvider>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </NFIDProvider>
      </AbstractWalletProvider>
    </QueryClientProvider>
  );
}
