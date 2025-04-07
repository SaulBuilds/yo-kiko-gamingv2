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
import { WalletSelectModal } from "@/components/wallet/wallet-select-modal";
import { useLoginWithAbstract } from "@abstract-foundation/agw-react";
import { useMultiWallet } from "@/hooks/use-multi-wallet";
import { Wallet } from "lucide-react";

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
  const { isAbstractConnecting } = useMultiWallet();
  
  // Wrap the Abstract login function to return a Promise
  const abstractLogin = async (): Promise<void> => {
    try {
      rawAbstractLogin();
      return Promise.resolve();
    } catch (error) {
      console.error("Abstract login error:", error);
      return Promise.reject(error);
    }
  };

  const profileForm = useForm({
    resolver: zodResolver(insertUserSchema.pick({ username: true, avatar: true })),
  });

  // Open wallet selection modal
  const handleOpenModal = () => {
    console.log("Opening wallet selection modal");
    setIsModalOpen(true);
  };

  // Close wallet selection modal
  const handleCloseModal = async (): Promise<void> => {
    console.log("Closing wallet selection modal");
    setIsModalOpen(false);
    return Promise.resolve();
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
                  onClick={handleOpenModal}
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

      {/* Wallet Selection Modal */}
      <WalletSelectModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        useAbstractWalletConnect={abstractLogin}
        isAbstractConnecting={isAbstractConnecting}
      />
    </div>
  );
}