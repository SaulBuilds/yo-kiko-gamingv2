import { AbstractWalletProvider } from "@abstract-foundation/agw-react";
import { abstractTestnet } from "viem/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/hooks/use-auth";
import { Toaster } from "@/components/ui/toaster";

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
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </AbstractWalletProvider>
    </QueryClientProvider>
  );
}
