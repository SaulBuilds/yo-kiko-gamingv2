import { useLocation } from "wouter";
import { SEO } from "@/components/seo";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight, Info, Coins } from "lucide-react";
import { SiEthereum } from "react-icons/si";
import { Image } from "@/components/ui/image";
import { motion } from "framer-motion";

/**
 * WalletSelector component
 * Provides a clear choice between different wallet types
 * 
 * @returns {JSX.Element} The wallet selector page component
 */
export default function WalletSelector() {
  const [_, setLocation] = useLocation();
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      <SEO 
        title="Choose Your Wallet" 
        description="Select your preferred wallet type to start playing games on our platform" 
      />
      
      <div className="container max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <Image 
            src="/assets/yo-kiko_lettermark.svg" 
            alt="Yo-Kiko"
            className="h-20 w-auto mx-auto mb-6"
          />
          <h1 className="text-4xl font-bold mb-4 pixel-font">Choose Your Wallet</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Select the blockchain ecosystem you want to use for playing games and placing wagers
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Abstract Wallet Card */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card className="h-full border-2 hover:border-primary/70 transition-all cursor-pointer"
                  onClick={() => setLocation("/auth-abstract")}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-2xl font-bold">Abstract Wallet</CardTitle>
                  <div className="p-3 rounded-full bg-yellow-500/10 text-yellow-500">
                    <SiEthereum size={24} />
                  </div>
                </div>
                <CardDescription>
                  The easiest way to connect with ETH
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="aspect-video relative overflow-hidden rounded-lg bg-gradient-to-br from-yellow-500/20 to-amber-700/20">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <img
                      src="/assets/abstract.svg"
                      alt="Abstract Logo"
                      className="h-20 w-auto object-contain"
                    />
                  </div>
                </div>
                
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <Coins className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Wager and earn with ETH</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span>Simple and secure wallet connection</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={() => setLocation("/auth-abstract")}>
                  Choose Abstract
                  <ChevronRight className="ml-auto h-5 w-5" />
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
          
          {/* NFID Wallet Card */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card className="h-full border-2 hover:border-primary/70 transition-all cursor-pointer"
                  onClick={() => setLocation("/auth-nfid")}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-2xl font-bold">NFID Wallet</CardTitle>
                  <div className="p-3 rounded-full bg-blue-500/10 text-blue-500">
                    <img
                      src="/assets/nfid-icon.svg"
                      alt="NFID Icon"
                      className="w-6 h-6"
                    />
                  </div>
                </div>
                <CardDescription>
                  Internet Computer Protocol authentication
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="aspect-video relative overflow-hidden rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-700/20">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <img
                      src="/assets/IC_logo_horizontal_white.svg"
                      alt="Internet Computer Logo"
                      className="h-20 w-auto object-contain"
                    />
                  </div>
                </div>
                
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <Coins className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Wager and earn with ICP tokens</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span>Decentralized identity system</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={() => setLocation("/auth-nfid")}>
                  Choose NFID
                  <ChevronRight className="ml-auto h-5 w-5" />
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </div>
        
        <div className="mt-12 text-center">
          <p className="text-muted-foreground mb-4">
            Not sure which one to choose? Both options provide a great gaming experience.
          </p>
          <Button variant="link" onClick={() => setLocation("/")}>
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}