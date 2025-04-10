import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ETHBetButtonProps {
  gameId: string;
  matchId?: string;
  defaultAmount?: string;
  disabled?: boolean;
  onBetConfirmed?: (amount: string) => void;
  className?: string;
}

/**
 * ETHBetButton component
 * A specialized button for placing bets using ETH via Abstract wallet
 * 
 * @param {ETHBetButtonProps} props - Component props
 * @returns {JSX.Element} The ETH bet button component
 */
export function ETHBetButton({ 
  gameId, 
  matchId, 
  defaultAmount = '0.001', 
  disabled = false,
  onBetConfirmed,
  className 
}: ETHBetButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [betAmount, setBetAmount] = useState(defaultAmount);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { address } = useAuth();
  const { toast } = useToast();

  // Handle the bet placement - this is just a mock
  const handlePlaceBet = async () => {
    if (!address) {
      toast({
        title: "Not connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Simulate API call / blockchain transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log(`Placing ETH bet of ${betAmount} for game ${gameId} ${matchId ? `in match ${matchId}` : ''}`);
      
      // For a real implementation, we would:
      // 1. Call the smart contract to process the bet
      // 2. Wait for transaction confirmation
      // 3. Record the bet in our database
      
      toast({
        title: "Bet placed successfully",
        description: `You bet ${betAmount} ETH on ${gameId}`,
      });
      
      if (onBetConfirmed) {
        onBetConfirmed(betAmount);
      }
      
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error placing bet:", error);
      toast({
        title: "Failed to place bet",
        description: "Something went wrong while placing your bet",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
        disabled={disabled || !address}
        variant="outline"
        className={className}
      >
        <img 
          src="/assets/abstract-logo.svg" 
          alt="ETH" 
          className="w-4 h-4 mr-2"
        />
        Bet with ETH
      </Button>
      
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Place ETH Bet</DialogTitle>
            <DialogDescription>
              Enter the amount of ETH you want to bet on {gameId}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="bet-amount">Bet Amount (ETH)</Label>
              <Input
                id="bet-amount"
                type="number"
                step="0.001"
                min="0.001"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                placeholder="Enter amount in ETH"
              />
              <p className="text-xs text-muted-foreground">
                Minimum bet: 0.001 ETH
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handlePlaceBet}
              disabled={isSubmitting || !betAmount || parseFloat(betAmount) < 0.001}
            >
              {isSubmitting ? (
                <>
                  <Spinner className="mr-2" size="sm" />
                  Placing Bet...
                </>
              ) : (
                'Place Bet'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}