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
import { WalletConnect } from "@/components/wallet/wallet-connect";

export default function AuthPage() {
  const [_, setLocation] = useLocation();
  const { user, address, updateProfileMutation } = useAuth();
  const [showProfile, setShowProfile] = useState(false);

  const profileForm = useForm({
    resolver: zodResolver(insertUserSchema.pick({ username: true, avatar: true })),
  });

  if (user && !showProfile) {
    setLocation("/");
    return null;
  }

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      <div className="flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 space-y-6">
            {!address ? (
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
                <WalletConnect />
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
        <h1 className="text-4xl font-bold mb-4 text-primary">
          Crypto Gaming Platform
        </h1>
        <p className="text-lg text-muted-foreground">
          Welcome to the future of competitive gaming. Connect your wallet to start
          playing classic arcade games, compete with players worldwide, and win
          cryptocurrency rewards.
        </p>
      </div>
    </div>
  );
}