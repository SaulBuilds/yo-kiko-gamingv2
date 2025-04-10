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
import { Globe, Wallet } from "lucide-react";
import { Image } from "@/components/ui/image";
import { useLoginWithAbstract } from "@abstract-foundation/agw-react";
import { useToast } from "@/hooks/use-toast";

export default function AuthPage() {
  const [_, setLocation] = useLocation();
  const { user, address, updateProfileMutation } = useAuth();
  const [showProfile, setShowProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { login: loginWithAbstract } = useLoginWithAbstract();

  const profileForm = useForm({
    resolver: zodResolver(insertUserSchema.pick({ username: true, avatar: true })),
  });

  // If we have a user and not showing profile, redirect to dashboard
  if (user && !showProfile) {
    setLocation("/dashboard");
    return null;
  }

  const handleCombinedLogin = async () => {
    setIsLoading(true);
    
    try {
      console.log("Starting combined login flow...");
      
      // First: Internet Identity login (mocked for now)
      // In a real implementation, we would integrate with Internet Identity here
      console.log("Starting ICP authentication...");
      
      // Simulate ICP login
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock principal for demonstration
      const mockPrincipal = "5uylz-j7fcd-isj73-gp57f-xwwyy-po2ib-7iboa-fdkdv-nrsam-3bd3r-qqe";
      localStorage.setItem('icp_principal', mockPrincipal);
      
      // Create a mock user for ICP
      await fetch("/api/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          walletAddress: mockPrincipal,
          walletType: "icp" 
        }),
      });
      
      toast({
        title: "Step 1 Complete",
        description: "Internet Identity authenticated! Connecting with Abstract wallet...",
      });

      // Second: Abstract login 
      console.log("Starting Abstract login...");
      
      // Trigger Abstract login - this will open the Abstract modal
      loginWithAbstract();
      
      // No need to handle redirects as Abstract will handle that
      
    } catch (error) {
      console.error("Combined login error:", error);
      toast({
        title: "Connection Failed",
        description: "Could not complete the authentication process. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
                
                {/* Logos and Explainer */}
                <div className="space-y-6 mb-6">
                  <div className="flex gap-4 justify-center items-center">
                    <Image src="/assets/IC_logo_horizontal_white.svg" alt="Internet Computer" className="h-8 w-auto" />
                    <span className="flex items-center text-lg">+</span>
                    <Image src="/assets/abstract.svg" alt="Abstract" className="h-8 w-auto" />
                  </div>
                  
                  <Card className="bg-slate-100 dark:bg-slate-800 p-4 shadow-sm">
                    <CardContent className="pt-4 px-2 text-left">
                      <h3 className="font-bold text-md mb-2">How it works:</h3>
                      <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                        <li>
                          <span className="font-semibold">Verify your uniqueness</span> with Internet Identity - 
                          a decentralized authentication system that proves you're a real person without revealing personal information
                        </li>
                        <li>
                          <span className="font-semibold">Access Web3 features</span> with Abstract - 
                          a non-custodial wallet that lets you bet, win, and collect rewards without managing private keys
                        </li>
                      </ol>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Login Button */}
                <Button 
                  onClick={handleCombinedLogin}
                  className="w-full relative overflow-hidden"
                  variant="default"
                  size="lg"
                  style={{ 
                    minHeight: "3.5rem",
                    padding: "0.75rem 1.5rem",
                    whiteSpace: "normal",
                    height: "auto"
                  }}
                  disabled={isLoading}
                >
                  <div className="flex items-center justify-center gap-3 w-full text-base">
                    <div className="flex shrink-0 gap-2">
                      <Globe className="w-5 h-5" />
                      <Wallet className="w-5 h-5" />
                    </div>
                    <span className="font-medium">
                      {isLoading ? "Connecting..." : "Connect with Abstract via Internet Identity"}
                    </span>
                  </div>
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
        <h2 className="text-3xl font-bold mb-4">Play, Compete, Earn</h2>
        <p className="text-lg text-muted-foreground">
          Welcome to the future of competitive gaming. Connect your wallet to start
          playing classic arcade games, compete with players worldwide, and win
          cryptocurrency rewards.
        </p>
      </div>
    </div>
  );
}