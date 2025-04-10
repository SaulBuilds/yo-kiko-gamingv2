import { useLocation } from "wouter";
import { SEO } from "@/components/seo";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Info, ExternalLink } from "lucide-react";

/**
 * WalletAlternatives component
 * Provides information about alternative ICP wallet options
 * 
 * @returns {JSX.Element} The wallet alternatives page component
 */
export default function WalletAlternatives() {
  const [_, setLocation] = useLocation();
  
  const walletOptions = [
    {
      name: "Plug Wallet",
      description: "A Chrome extension wallet for the Internet Computer",
      website: "https://plugwallet.ooo/",
      benefits: [
        "Browser extension - no iframe injection issues",
        "Well-documented JavaScript API",
        "Active community and support",
        "Supports multiple identities"
      ]
    },
    {
      name: "Stoic Wallet",
      description: "A web-based wallet for the Internet Computer",
      website: "https://www.stoicwallet.com/",
      benefits: [
        "Web-based solution (no extension required)",
        "Simple JavaScript API",
        "Supports ledger hardware wallets",
        "Works on mobile browsers"
      ]
    },
    {
      name: "Internet Identity",
      description: "The authentication system built into the Internet Computer",
      website: "https://identity.ic0.app/",
      benefits: [
        "Native to Internet Computer",
        "Device-based authentication",
        "High security standards",
        "Core part of the Internet Computer Protocol"
      ]
    }
  ];
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      <SEO 
        title="Alternative ICP Wallet Options" 
        description="Explore alternative wallet options for the Internet Computer Protocol" 
      />
      
      <div className="container max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Alternative ICP Wallet Options</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Since we're experiencing issues with the NFID integration, here are some alternative
            wallet options for ICP that we could consider implementing.
          </p>
        </div>
        
        <div className="space-y-8">
          {walletOptions.map(wallet => (
            <Card key={wallet.name} className="border-2 hover:border-primary/40 transition-all">
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl font-bold">{wallet.name}</CardTitle>
                <CardDescription>
                  {wallet.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <Info className="h-4 w-4 text-blue-500" />
                  Key Benefits
                </h3>
                <ul className="list-disc pl-5 space-y-1">
                  {wallet.benefits.map((benefit, index) => (
                    <li key={index} className="text-muted-foreground">{benefit}</li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <a href={wallet.website} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                    Visit Website <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <p className="text-muted-foreground mb-4">
            Would you like me to implement one of these alternatives instead of NFID?
          </p>
          <Button onClick={() => setLocation("/")}>
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}