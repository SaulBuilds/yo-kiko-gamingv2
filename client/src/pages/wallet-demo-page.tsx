import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SEO } from "@/components/seo";
import { ConnectWallet } from "@/components/connect-wallet";
import { ConnectWallet as NFIDOfficialButton } from "@nfid/identitykit/react";
import { NFIDConnectButton } from "@/components/nfid/nfid-connect-button";
import { useMultiWallet } from "@/hooks/use-multi-wallet";
import { useAuth } from "@/hooks/use-auth";
import { WalletBasedBetUI } from "@/components/betting/wallet-based-bet-ui";
import { NFIDModalButton } from "@/components/nfid/nfid-modal-button";
import { AbstractModalButton } from "@/components/abstract/abstract-modal-button";

/**
 * WalletDemoPage component
 * Demonstrates the different wallet authentication options and betting components
 * 
 * @returns {JSX.Element} The wallet demo page component
 */
export default function WalletDemoPage() {
  const { activeWalletType, walletAddress, isConnected, connectAbstract, isAbstractConnecting } = useMultiWallet();
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState<string>("wallet-connect");
  
  // Handler for bet notifications
  const handleBetPlaced = (walletType: string, amount: string) => {
    console.log(`Bet placed: ${amount} ${walletType}`);
  };

  return (
    <>
      <SEO title="Wallet Demo" description="Test our wallet integration and betting components" />
      
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-6">Wallet & Betting Demo</h1>
        
        <Tabs 
          defaultValue="wallet-connect" 
          value={selectedTab} 
          onValueChange={setSelectedTab}
          className="space-y-6"
        >
          <TabsList className="grid grid-cols-2 w-full max-w-md">
            <TabsTrigger value="wallet-connect">Authentication</TabsTrigger>
            <TabsTrigger value="betting" disabled={!isConnected}>Betting</TabsTrigger>
          </TabsList>
          
          {/* Authentication Demo */}
          <TabsContent value="wallet-connect" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Connection Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Wallet Status</CardTitle>
                  <CardDescription>Your current connection state</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium">Connection Status:</p>
                      <p className={`text-lg ${isConnected ? 'text-green-500' : 'text-yellow-500'}`}>
                        {isConnected ? 'Connected' : 'Not Connected'}
                      </p>
                    </div>
                    
                    {isConnected && (
                      <>
                        <div>
                          <p className="text-sm font-medium">Wallet Type:</p>
                          <p className="text-lg">{activeWalletType || 'Unknown'}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium">Address:</p>
                          <p className="text-xs break-all">{walletAddress}</p>
                        </div>
                        
                        {user && (
                          <div>
                            <p className="text-sm font-medium">User ID:</p>
                            <p className="text-lg">{user.id}</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              {/* ConnectWallet Component */}
              <Card>
                <CardHeader>
                  <CardTitle>ConnectWallet Component</CardTitle>
                  <CardDescription>Our unified wallet connection button</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center items-center h-[200px]">
                  <ConnectWallet />
                </CardContent>
              </Card>
              
              {/* NFID Native Button */}
              <Card>
                <CardHeader>
                  <CardTitle>NFID Native Button</CardTitle>
                  <CardDescription>The official NFID ConnectWallet component</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col justify-center items-center h-[200px] gap-4">
                  <div className="w-full">
                    <NFIDOfficialButton />
                  </div>
                  <div className="w-full mt-4">
                    <NFIDConnectButton />
                  </div>
                </CardContent>
              </Card>
              
              {/* Individual Wallet Buttons */}
              <Card className="md:col-span-3">
                <CardHeader>
                  <CardTitle>Individual Wallet Buttons</CardTitle>
                  <CardDescription>Testing our specialized wallet button components</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <h3 className="text-md font-medium">Abstract Wallet</h3>
                      <AbstractModalButton 
                        onConnect={connectAbstract}
                        isConnecting={isAbstractConnecting}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-md font-medium">NFID Wallet</h3>
                      <NFIDModalButton />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Betting Demo */}
          <TabsContent value="betting" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Betting Component Demo */}
              <Card>
                <CardHeader>
                  <CardTitle>Wallet-Based Bet UI</CardTitle>
                  <CardDescription>Betting UI that adapts to the connected wallet</CardDescription>
                </CardHeader>
                <CardContent>
                  <WalletBasedBetUI 
                    gameId="tetris"
                    matchId="demo-match-123"
                    onBetPlaced={handleBetPlaced}
                  />
                </CardContent>
              </Card>
              
              {/* Mocked Game Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Game Information</CardTitle>
                  <CardDescription>Details about the current game</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium">Game:</p>
                      <p className="text-lg">Tetris Demo</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium">Match ID:</p>
                      <p className="text-lg">demo-match-123</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium">Status:</p>
                      <p className="text-lg text-yellow-500">Waiting for players</p>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <p className="text-sm font-medium">Your Stats:</p>
                      <p className="text-lg">Level 5 • 2000 XP</p>
                    </div>
                    
                    <Button onClick={() => setSelectedTab("wallet-connect")}>
                      Back to Authentication
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}