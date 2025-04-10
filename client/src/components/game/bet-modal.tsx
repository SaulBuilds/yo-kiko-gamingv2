import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface BetModalProps {
  open: boolean;
  onClose: () => void;
  gameType: 'tetris' | 'temple-runner' | 'street-fighter';
}

export function BetModal({ open, onClose, gameType }: BetModalProps) {
  const [_, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [betType, setBetType] = useState<"xp" | "crypto">("xp");
  const [cryptoType, setCryptoType] = useState<"eth" | "icp">("eth");
  const [betAmount, setBetAmount] = useState("");

  const createMatchMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/matches", {
        betAmount,
        betType,
        cryptoType: betType === "crypto" ? cryptoType : undefined,
        gameType,
        isPractice: false
      });
      if (!res.ok) throw new Error("Failed to create match");
      return res.json();
    },
    onSuccess: (match) => {
      toast({
        title: "Match Created",
        description: "Waiting for opponent...",
      });
      
      switch (gameType) {
        case 'tetris':
          setLocation(`/game/${match.id}`);
          break;
        case 'temple-runner':
          setLocation(`/temple-runner/${match.id}`);
          break;
        case 'street-fighter':
          setLocation(`/street-fighter/match/${match.id}`);
          break;
        default:
          setLocation(`/game/${match.id}`);
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCreateMatch = () => {
    if (!betAmount) {
      toast({
        title: "Error",
        description: "Please enter a bet amount",
        variant: "destructive",
      });
      return;
    }

    if (betType === "xp" && user?.xp && parseInt(betAmount) > user.xp) {
      toast({
        title: "Error",
        description: "Insufficient XP balance",
        variant: "destructive",
      });
      return;
    }

    createMatchMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Create Wager Match</DialogTitle>
          <DialogDescription>
            Set up your bet and wait for an opponent to accept the challenge.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label>Bet Type</Label>
            <RadioGroup
              defaultValue="xp"
              onValueChange={(value) => setBetType(value as "xp" | "crypto")}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="xp" id="xp" />
                <Label htmlFor="xp">XP Points {user?.xp ? `(${user.xp} available)` : ''}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="crypto" id="crypto" />
                <Label htmlFor="crypto">Crypto</Label>
              </div>
            </RadioGroup>
          </div>

          {betType === "crypto" && (
            <div className="space-y-2">
              <Label>Cryptocurrency</Label>
              <Select 
                value={cryptoType} 
                onValueChange={(value) => setCryptoType(value as "eth" | "icp")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select cryptocurrency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="eth">Ethereum (ETH)</SelectItem>
                  <SelectItem value="icp">Internet Computer (ICP)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div className="space-y-2">
            <Label>Bet Amount</Label>
            <Input
              type="number"
              placeholder={
                betType === 'xp' ? "Enter XP amount" : 
                cryptoType === 'eth' ? "Enter ETH amount" : "Enter ICP amount"
              }
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
              min="0"
              step={betType === 'xp' ? "1" : "0.001"}
            />
          </div>

          <div className="flex gap-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleCreateMatch}
              disabled={createMatchMutation.isPending}
            >
              Create Match
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}