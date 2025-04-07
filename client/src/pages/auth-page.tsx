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
import { Wallet } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Card as CardUI, CardContent as CardContentUI, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth as useNFIDAuth } from "@nfid/identitykit/react";
import { useLoginWithAbstract } from "@abstract-foundation/agw-react";

/**
 * AuthPage component that displays the authentication screen and wallet connection options
 * @returns {JSX.Element} The authentication page component
 */
export default function AuthPage() {
  const [_, setLocation] = useLocation();
  const { user, address, updateProfileMutation } = useAuth();
  const [showProfile, setShowProfile] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { login: rawAbstractLogin } = useLoginWithAbstract();
  const { toast } = useToast();
  const { connect: connectNFID, isConnecting: isNFIDConnecting } = useNFIDAuth();
  const [isAbstractConnecting, setIsAbstractConnecting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const profileForm = useForm({
    resolver: zodResolver(insertUserSchema.pick({ username: true, avatar: true })),
  });

  // Handle Abstract connect
  const handleAbstractConnect = async () => {
    try {
      setIsAbstractConnecting(true);
      rawAbstractLogin();
      toast({
        title: "Connecting with Abstract",
        description: "Please check your wallet for connection request",
      });
      closeModal();
    } catch (error) {
      console.error("Failed to connect with Abstract Wallet:", error);
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect with Abstract Wallet",
        variant: "destructive",
      });
    } finally {
      setIsAbstractConnecting(false);
    }
  };

  // Handle NFID connect
  const handleNFIDConnect = async () => {
    try {
      setIsLoading(true);
      await connectNFID();
      toast({
        title: "Connected with NFID",
        description: "You've successfully connected with NFID wallet",
      });
      closeModal();
    } catch (error) {
      console.error("Failed to connect with NFID:", error);
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect with NFID wallet",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Open wallet selection modal
  const openModal = () => {
    console.log("Opening wallet selection modal");
    setIsModalOpen(true);
  };

  // Close wallet selection modal
  const closeModal = () => {
    console.log("Closing wallet selection modal");
    setIsModalOpen(false);
  };

  // Redirect to home if user is authenticated
  if (user && !showProfile) {
    setLocation("/");
    return null;
  }

  return (
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
              <div className="text-center space-y-4">
                <h2 className="text-2xl font-bold mb-4">Welcome to Yo-Kiko</h2>
                <p className="text-muted-foreground mb-6">
                  Connect your wallet to start playing and earning rewards
                </p>
                <Button 
                  onClick={openModal}
                  className="pixel-font flex items-center gap-2"
                  variant="default"
                  size="lg"
                >
                  <Wallet className="w-5 h-5 mr-2" />
                  Connect to Play
                </Button>
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

      {/* Directly embed the wallet selection modal instead of using a component */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Connect Your Wallet</DialogTitle>
            <DialogDescription>
              Choose your preferred wallet to connect to the platform
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            {/* Abstract Wallet Card */}
            <CardUI className="hover:border-primary/50 cursor-pointer transition-all" onClick={handleAbstractConnect}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Abstract Wallet</CardTitle>
                <CardDescription>Connect with AGW</CardDescription>
              </CardHeader>
              <CardContentUI className="pb-2">
                <div className="h-24 flex items-center justify-center">
                  <img 
                    src="/assets/abstract.svg" 
                    alt="Abstract Wallet" 
                    className="h-16 w-auto object-contain" 
                  />
                </div>
              </CardContentUI>
              <CardFooter>
                <Button 
                  className="w-full" 
                  variant="outline"
                  disabled={isAbstractConnecting || isLoading}
                >
                  {isAbstractConnecting ? "Connecting..." : "Connect"}
                </Button>
              </CardFooter>
            </CardUI>

            {/* NFID Wallet Card */}
            <CardUI className="hover:border-primary/50 cursor-pointer transition-all" onClick={handleNFIDConnect}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">NFID Wallet</CardTitle>
                <CardDescription>Connect with Internet Computer</CardDescription>
              </CardHeader>
              <CardContentUI className="pb-2">
                <div className="h-24 flex items-center justify-center">
                  <img 
                    src="/assets/IC_logo_horizontal_white.svg" 
                    alt="NFID Wallet" 
                    className="h-12 w-auto object-contain" 
                  />
                </div>
              </CardContentUI>
              <CardFooter>
                <Button 
                  className="w-full" 
                  variant="outline"
                  disabled={isNFIDConnecting || isLoading}
                >
                  {isNFIDConnecting ? "Connecting..." : "Connect"}
                </Button>
              </CardFooter>
            </CardUI>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={closeModal}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}