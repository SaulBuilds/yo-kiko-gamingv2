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
import { AbstractModalButton } from "@/components/abstract/abstract-modal-button";
import { useMultiWallet } from "@/hooks/use-multi-wallet";

/**
 * AbstractAuthPage component that displays the Abstract wallet authentication screen
 * @returns {JSX.Element} The Abstract authentication page component
 */
export default function AbstractAuthPage() {
  const [_, setLocation] = useLocation();
  const { user, address, updateProfileMutation } = useAuth();
  const [showProfile, setShowProfile] = useState(false);
  
  // Get Abstract wallet connection functions
  const { connectAbstract, isAbstractConnecting } = useMultiWallet();
  
  // Profile form
  const profileForm = useForm({
    resolver: zodResolver(insertUserSchema.pick({ username: true, avatar: true })),
  });

  // Redirect to home if user is authenticated
  if (user && !showProfile) {
    setLocation("/dashboard");
    return null;
  }

  return (
    <>
      <SEO title="Connect with Abstract Wallet" description="Connect your Abstract wallet to start playing games with ETH wagering" />
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
                    <h2 className="text-2xl font-bold mb-4">Connect with Abstract Wallet</h2>
                    <p className="text-muted-foreground mb-6">
                      Use Abstract Wallet to play with ETH wagering
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Abstract Wallet Button */}
                    <AbstractModalButton
                      onConnect={connectAbstract}
                      isConnecting={isAbstractConnecting}
                    />
                    
                    <div className="text-center pt-4">
                      <Button
                        variant="link"
                        onClick={() => setLocation("/auth-nfid")}
                        className="text-sm text-muted-foreground"
                      >
                        Prefer to use NFID Wallet? Click here
                      </Button>
                    </div>
                  </div>
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
                        setLocation("/dashboard");
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
                        setLocation("/dashboard");
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
          <h2 className="text-3xl font-bold mb-4">ETH Gaming Platform</h2>
          <p className="text-lg text-muted-foreground">
            With Abstract Wallet, you can play competitive games and
            wager using ETH. Connect your wallet to start playing and earning.
          </p>
          
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-2">Abstract Wallet Features</h3>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>ETH-based wagering</li>
              <li>Multi-chain support</li>
              <li>Simple verification</li>
              <li>Secure key management</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}