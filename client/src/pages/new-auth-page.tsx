import { useState, useRef, useEffect } from "react";
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
import { Wallet } from "lucide-react";
import { useLoginWithAbstract } from "@abstract-foundation/agw-react";
import { useMultiWallet } from "@/hooks/use-multi-wallet";
import { useNFID } from "@/hooks/use-nfid";
import { SEO } from "@/components/seo";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";

/**
 * NewAuthPage component that displays the authentication screen with separate wallet options
 * @returns {JSX.Element} The authentication page component
 */
export default function NewAuthPage() {
  const [_, setLocation] = useLocation();
  const { user, address, updateProfileMutation } = useAuth();
  const [showProfile, setShowProfile] = useState(false);
  
  // NFID setup
  const { connect: nfidConnect, isConnecting: isNFIDConnecting, error: nfidError } = useNFID();
  const nfidContainerRef = useRef<HTMLDivElement>(null);
  const [nfidUIVisible, setNfidUIVisible] = useState(false);
  
  // Abstract setup
  const { connectAbstract, isAbstractConnecting } = useMultiWallet();
  
  // Profile form
  const profileForm = useForm({
    resolver: zodResolver(insertUserSchema.pick({ username: true, avatar: true })),
  });

  // Handle direct Abstract connection
  const handleAbstractConnect = async () => {
    try {
      console.log("Starting Abstract login from auth page...");
      await connectAbstract();
    } catch (error) {
      console.error("Abstract login error:", error);
    }
  };

  // Handle direct NFID connection
  const handleNFIDConnect = async () => {
    try {
      console.log("Starting NFID login from auth page...");
      await nfidConnect();
    } catch (error) {
      console.error("NFID login error:", error);
    }
  };

  // Setup handler to capture and relocate NFID UI to our container
  useEffect(() => {
    // Define a style for NFID elements when they're in our container
    const styleElement = document.createElement('style');
    styleElement.innerHTML = `
      /* Container styling when NFID UI is present */
      .nfid-container-active {
        border: 1px solid rgba(255, 255, 255, 0.1);
        background-color: rgba(0, 0, 0, 0.2);
        padding: 8px;
        border-radius: 8px;
        margin-top: 1rem;
      }
      
      /* Style for NFID UI elements once relocated */
      .nfid-container-active > div {
        position: static !important;
        margin: 0 !important;
        width: 100% !important;
        max-width: 100% !important;
        border-radius: 8px !important;
        background: transparent !important;
        bottom: auto !important;
        left: auto !important;
        right: auto !important;
      }
    `;
    
    document.head.appendChild(styleElement);

    // Create an observer to watch for NFID UI elements appearing
    const observer = new MutationObserver((mutations) => {
      // Look for bottom bar elements when they appear
      const nfidElements = document.querySelector('div[style*="position: fixed"][style*="bottom: 0"]');
      if (nfidElements && nfidContainerRef.current) {
        try {
          // Stop observing to prevent loops
          observer.disconnect();
          
          // Move the element to our container
          nfidContainerRef.current.innerHTML = '';
          nfidContainerRef.current.appendChild(nfidElements);
          nfidContainerRef.current.classList.add('nfid-container-active');
          
          // Mark that we have NFID UI visible
          setNfidUIVisible(true);
          
          // Re-observe after modifications
          observer.observe(document.body, { childList: true, subtree: true });
        } catch (err) {
          console.error("Error relocating NFID interface:", err);
        }
      }
    });
    
    // Start observing
    observer.observe(document.body, { childList: true, subtree: true });
    
    // Clean up
    return () => {
      observer.disconnect();
      document.head.removeChild(styleElement);
    };
  }, []);

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
                  
                  <Tabs defaultValue="options" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="options">Wallet Options</TabsTrigger>
                      <TabsTrigger value="nfid">NFID (ICP)</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="options" className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Button 
                          onClick={handleAbstractConnect}
                          disabled={isAbstractConnecting}
                          className="w-full py-6 relative"
                          variant="outline"
                        >
                          {isAbstractConnecting ? (
                            <Spinner className="mr-2" />
                          ) : (
                            <img 
                              src="/assets/abstract-logo.svg" 
                              alt="Abstract Wallet" 
                              className="w-6 h-6 mr-2"
                            />
                          )}
                          <div className="flex flex-col items-start">
                            <span className="font-semibold">Abstract Wallet</span>
                            <span className="text-xs text-muted-foreground">Connect with your EVM wallet</span>
                          </div>
                        </Button>
                        
                        <Separator className="my-4" />
                        
                        <Button 
                          onClick={handleNFIDConnect}
                          disabled={isNFIDConnecting}
                          className="w-full py-6 relative"
                          variant="outline"
                        >
                          {isNFIDConnecting ? (
                            <Spinner className="mr-2" />
                          ) : (
                            <img 
                              src="/assets/nfid-logo.svg" 
                              alt="NFID" 
                              className="w-6 h-6 mr-2"
                            />
                          )}
                          <div className="flex flex-col items-start">
                            <span className="font-semibold">NFID</span>
                            <span className="text-xs text-muted-foreground">Connect with Internet Computer</span>
                          </div>
                        </Button>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="nfid" className="space-y-4 pt-4">
                      <p className="text-sm text-muted-foreground mb-4">
                        Connect to Internet Computer using NFID
                      </p>
                      
                      {!nfidUIVisible && (
                        <Button 
                          onClick={handleNFIDConnect}
                          disabled={isNFIDConnecting}
                          className="w-full"
                          variant="default"
                        >
                          {isNFIDConnecting ? (
                            <Spinner className="mr-2" />
                          ) : (
                            <img 
                              src="/assets/nfid-logo.svg" 
                              alt="NFID" 
                              className="w-6 h-6 mr-2"
                            />
                          )}
                          Connect with NFID
                        </Button>
                      )}
                      
                      {/* Container where NFID UI will be moved */}
                      <div 
                        ref={nfidContainerRef} 
                        className="w-full rounded-md overflow-hidden"
                      ></div>
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