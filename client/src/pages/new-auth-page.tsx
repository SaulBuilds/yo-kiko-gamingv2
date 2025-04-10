import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { insertUserSchema } from "@shared/schema";
import { Image } from "@/components/ui/image";
import { SEO } from "@/components/seo";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Import our wallet button components
import { AbstractModalButton } from "@/components/abstract/abstract-modal-button";
import { NFIDModalButton } from "@/components/nfid/nfid-modal-button";
import { ConnectWallet } from "@nfid/identitykit/react";
import { useMultiWallet } from "@/hooks/use-multi-wallet";

/**
 * NewAuthPage component that displays the authentication screen with separate wallet options
 * @returns {JSX.Element} The authentication page component
 */
export default function NewAuthPage() {
  const [_, setLocation] = useLocation();
  const { user, address, updateProfileMutation } = useAuth();
  const [showProfile, setShowProfile] = useState(false);
  
  // Get wallet connection functions from our multi-wallet hook
  const { connectAbstract, isAbstractConnecting } = useMultiWallet();
  
  // Profile form
  const profileForm = useForm({
    resolver: zodResolver(insertUserSchema.pick({ username: true, avatar: true })),
  });

  // Redirect to home if user is authenticated
  if (user && !showProfile) {
    setLocation("/");
    return null;
  }

  return (
    <>
      <SEO title="Connect Your Wallet" description="Connect your wallet to start playing games and earning rewards" />
      <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
        <div className="flex items-center justify-center p-8">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6 space-y-6">
              <div className="flex items-center justify-center p-8">
                <Image 
                  src="/assets/yo-kiko_lettermark.svg" 
                  alt="Yo-Kiko"
                  className="h-20 w-auto items-center justify-center"
                />
              </div>
              {!address ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Welcome to Yo-Kiko</h2>
                    <p className="text-muted-foreground mb-6">
                      Choose your wallet type to start playing
                    </p>
                  </div>
                  
                  <Tabs defaultValue="wallet-options" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="wallet-options">Wallet Options</TabsTrigger>
                      <TabsTrigger value="nfid-native">NFID Native</TabsTrigger>
                    </TabsList>
                    
                    {/* Wallet Options Tab - Shows our custom buttons */}
                    <TabsContent value="wallet-options" className="space-y-4 pt-4">
                      <div className="space-y-4">
                        {/* Abstract Wallet Button */}
                        <AbstractModalButton
                          onConnect={connectAbstract}
                          isConnecting={isAbstractConnecting}
                        />
                        
                        {/* NFID Wallet Button with UI Capture */}
                        <NFIDModalButton />
                      </div>
                    </TabsContent>
                    
                    {/* NFID Native Tab - Shows the official NFID Connect Button */}
                    <TabsContent value="nfid-native" className="space-y-4 pt-4">
                      <p className="text-sm text-muted-foreground mb-4">
                        Connect with NFID's official button
                      </p>
                      
                      <div className="flex justify-center">
                        {/* This is the official NFID connector from their library */}
                        <ConnectWallet />
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              ) : !user ? (
                <div className="text-center">
                  <h2 className="text-xl font-semibold mb-4">Setting up your account...</h2>
                </div>
              ) : showProfile ? (
                <form
                  onSubmit={profileForm.handleSubmit((data) => {
                    updateProfileMutation.mutate(data, {
                      onSuccess: () => {
                        setShowProfile(false);
                        setLocation("/");
                      },
                    });
                  })}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="username">Username (Optional)</Label>
                    <Input
                      id="username"
                      placeholder="Choose a username"
                      {...profileForm.register("username")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="avatar">Avatar URL (Optional)</Label>
                    <Input
                      id="avatar"
                      placeholder="Enter avatar URL"
                      {...profileForm.register("avatar")}
                    />
                  </div>

                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setShowProfile(false);
                        setLocation("/");
                      }}
                    >
                      Skip
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={updateProfileMutation.isPending}
                    >
                      Save Profile
                    </Button>
                  </div>
                </form>
              ) : null}
            </CardContent>
          </Card>
        </div>

        <div className="hidden md:flex flex-col justify-center p-8 bg-primary/5">
          <h2 className="text-3xl font-bold mb-4">Play, Compete, Earn</h2>
          <p className="text-lg text-muted-foreground">
            Welcome to the future of competitive gaming. Connect your wallet to start
            playing classic arcade games, compete with players worldwide, and win
            cryptocurrency rewards.
          </p>
        </div>
      </div>
    </>
  );
}