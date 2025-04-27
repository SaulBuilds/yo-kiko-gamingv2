import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from "../components/ui/button";
import { Globe } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { AuthClient } from '@dfinity/auth-client';
import React from 'react';

export function ConnectICP() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [_, setLocation] = useLocation();

  const login = async () => {
    setIsLoading(true);
    try {
      const authClient = await AuthClient.create();
      await authClient.login({
        identityProvider: 'https://identity.ic0.app/#authorize',
        onSuccess: async () => {
          const identity = authClient.getIdentity();
          const principal = identity.getPrincipal().toText();
          localStorage.setItem('icp_principal', principal);
          const response = await fetch('/api/user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ walletAddress: principal, walletType: 'icp' }),
          });
          if (!response.ok) {
            throw new Error('Failed to create user');
          }
          toast({ title: 'Success!', description: 'Connected to Internet Identity' });
          setLocation('/dashboard');
        },
      });
    } catch (error) {
      console.error('ICP login error:', error);
      toast({
        title: 'Connection Failed',
        description: 'Could not connect to Internet Identity. Please try again.',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={login}
      className="pixel-font flex items-center gap-2 w-full"
      variant="secondary"
      disabled={isLoading}
    >
      <Globe className="w-4 h-4" />
      {isLoading ? "Connecting..." : "Connect with Internet Identity"}
    </Button>
  );
}