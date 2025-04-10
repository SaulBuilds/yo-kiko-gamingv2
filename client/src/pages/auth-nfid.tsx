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
import { SimpleNFIDButton } from "@/components/nfid/simple-nfid-button";
import { ConnectWallet as NFIDOfficialButton } from "@nfid/identitykit/react";

/**
 * NFIDAuthPage component that displays the NFID wallet authentication screen
 * @returns {JSX.Element} The NFID authentication page component
 */
export default function NFIDAuthPage() {
  const [_, setLocation] = useLocation();
  const { user, address, updateProfileMutation } = useAuth();
  const [showProfile, setShowProfile] = useState(false);
  
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
      <SEO title="Connect with NFID Wallet" description="Connect your Internet Computer NFID wallet to start playing games with ICP wagering" />
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
                    <h2 className="text-2xl font-bold mb-4">Connect with NFID Wallet</h2>
                    <p className="text-muted-foreground mb-6">
                      Use Internet Computer NFID to play with ICP wagering
                    </p>
                  </div>
                  
                  <div className="space-y-6">
                    {/* NFID Button Option 1: Our Custom UI */}
                    <div className="mb-4">
                      <p className="text-sm text-center text-muted-foreground mb-2">Option 1: Simple Button</p>
                      <SimpleNFIDButton />
                    </div>
                    
                    {/* NFID Button Option 2: Official UI */}
                    <div className="mb-4">
                      <p className="text-sm text-center text-muted-foreground mb-2">Option 2: Official NFID Button</p>
                      <div className="flex justify-center">
                        <NFIDOfficialButton />
                      </div>
                    </div>
                    
                    <div className="text-center pt-4 space-y-2">
                      <Button
                        variant="link"
                        onClick={() => setLocation("/auth-abstract")}
                        className="text-sm text-muted-foreground"
                      >
                        Prefer to use Abstract Wallet? Click here
                      </Button>
                      
                      <div>
                        <Button
                          variant="link"
                          onClick={() => setLocation("/wallet-alternatives")}
                          className="text-sm text-primary"
                        >
                          View alternative ICP wallet options
                        </Button>
                      </div>
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
          <h2 className="text-3xl font-bold mb-4">ICP Gaming Platform</h2>
          <p className="text-lg text-muted-foreground">
            With Internet Computer NFID, you can play competitive games and
            wager using ICP tokens. Connect your wallet to start playing and earning.
          </p>
          
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-2">NFID Wallet Features</h3>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>ICP-based wagering</li>
              <li>Internet Computer Authentication</li>
              <li>Decentralized identity</li>
              <li>Enhanced privacy controls</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}