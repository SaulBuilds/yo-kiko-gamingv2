import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/use-auth';
import { useICPEthBridge } from '@/lib/icp-eth-bridge';
import { Loader2 } from 'lucide-react';
import { WS_CONFIG } from '@/config/app-config';

interface ICPBetWidgetProps {
  matchId: number;
  opponentId?: number;
  isCreator: boolean;
}

export function ICPBetWidget({ matchId, opponentId, isCreator }: ICPBetWidgetProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [amount, setAmount] = useState('0.01');
  const [token, setToken] = useState('ETH');
  const [isLoading, setIsLoading] = useState(false);
  const { createBet, acceptBet, getBet, payoutWinner } = useICPEthBridge();
  const [betDetails, setBetDetails] = useState<any>(null);
  const [isCheckingBet, setIsCheckingBet] = useState(false);

  // Check if there's an existing bet for this match
  const checkExistingBet = async () => {
    if (!matchId) return;
    
    setIsCheckingBet(true);
    try {
      const bet = await getBet(matchId);
      setBetDetails(bet);
    } catch (error) {
      console.error('Error checking bet:', error);
      toast({
        title: 'Error',
        description: 'Failed to check for existing bet',
        variant: 'destructive',
      });
    } finally {
      setIsCheckingBet(false);
    }
  };

  // Create a new bet
  const handleCreateBet = async () => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to create a bet',
        variant: 'destructive',
      });
      return;
    }

    if (!matchId) {
      toast({
        title: 'Match Required',
        description: 'No match ID provided',
        variant: 'destructive',
      });
      return;
    }

    const amountWei = parseFloat(amount) * 1e18; // Convert to wei
    const tokenAddress = token === 'ETH' ? '0x0' : ''; // Use 0x0 for ETH
    
    setIsLoading(true);
    try {
      const txHash = await createBet(
        matchId,
        amountWei,
        tokenAddress,
        user.walletAddress || ''
      );
      
      toast({
        title: 'Bet Created',
        description: `Transaction hash: ${txHash.slice(0, 10)}...`,
      });
      
      // Refresh bet details
      await checkExistingBet();
    } catch (error) {
      console.error('Error creating bet:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create bet',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Accept an existing bet
  const handleAcceptBet = async () => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to accept a bet',
        variant: 'destructive',
      });
      return;
    }

    if (!matchId) {
      toast({
        title: 'Match Required',
        description: 'No match ID provided',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const txHash = await acceptBet(matchId);
      
      toast({
        title: 'Bet Accepted',
        description: `Transaction hash: ${txHash.slice(0, 10)}...`,
      });
      
      // Refresh bet details
      await checkExistingBet();
    } catch (error) {
      console.error('Error accepting bet:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to accept bet',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger payout to winner (admin or match creator only)
  const handlePayoutWinner = async (winnerAddress: string) => {
    if (!matchId) {
      toast({
        title: 'Match Required',
        description: 'No match ID provided',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const txHash = await payoutWinner(matchId, winnerAddress);
      
      toast({
        title: 'Payout Completed',
        description: `Transaction hash: ${txHash.slice(0, 10)}...`,
      });
      
      // Refresh bet details
      await checkExistingBet();
    } catch (error) {
      console.error('Error processing payout:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to process payout',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load bet details when component mounts
  React.useEffect(() => {
    if (matchId) {
      checkExistingBet();
    }
  }, [matchId]);

  // Set up WebSocket connection for real-time bet updates
  React.useEffect(() => {
    if (!matchId) return;

    // Create WebSocket connection using configuration
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}${WS_CONFIG.icpBetsWsPath}`;
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log('WebSocket connection established for bet updates');
      // Subscribe to updates for this match
      socket.send(JSON.stringify({
        type: 'subscribe',
        matchId: matchId,
        userId: user?.id
      }));
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'betUpdate' && data.matchId === matchId) {
          // Update the bet details
          setBetDetails(data.bet);
          
          // Show toast notification
          toast({
            title: 'Bet Updated',
            description: data.message || 'Bet status has been updated',
          });
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    // Clean up on unmount
    return () => {
      socket.close();
    };
  }, [matchId, user?.id]);

  if (isCheckingBet) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6 flex justify-center items-center">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="ml-2">Checking bet status...</p>
        </CardContent>
      </Card>
    );
  }

  // If there's an existing bet, show its details
  if (betDetails) {
    const isBetActive = betDetails.is_active;
    const isPaid = betDetails.is_paid;
    const player1 = betDetails.player1;
    const player2 = betDetails.player2 || '';
    const amount = (Number(betDetails.amount) / 1e18).toFixed(6);
    const tokenAddress = betDetails.token_address;
    const tokenSymbol = tokenAddress === '0x0' ? 'ETH' : 'TOKEN';
    
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Bet Details</CardTitle>
          <CardDescription>
            {isBetActive ? 
              player2 ? 'Both players have joined the bet' : 'Waiting for opponent to accept bet' 
              : isPaid ? 'Bet has been paid out' : 'Bet is no longer active'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Amount:</span>
              <span className="font-bold">{amount} {tokenSymbol}</span>
            </div>
            <div className="flex justify-between">
              <span>Creator:</span>
              <span className="font-mono text-sm">{player1.slice(0, 6)}...{player1.slice(-4)}</span>
            </div>
            {player2 && (
              <div className="flex justify-between">
                <span>Opponent:</span>
                <span className="font-mono text-sm">{player2.slice(0, 6)}...{player2.slice(-4)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Status:</span>
              <span className={`font-bold ${isPaid ? 'text-green-600' : isBetActive ? 'text-yellow-600' : 'text-red-600'}`}>
                {isPaid ? 'Paid Out' : isBetActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          {isBetActive && !player2 && user?.walletAddress !== player1 && (
            <Button 
              onClick={handleAcceptBet} 
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Accept Bet
            </Button>
          )}
          {isBetActive && player2 && isCreator && (
            <>
              <Button 
                variant="outline" 
                onClick={() => handlePayoutWinner(player1)} 
                disabled={isLoading}
              >
                Player 1 Won
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handlePayoutWinner(player2)} 
                disabled={isLoading}
              >
                Player 2 Won
              </Button>
            </>
          )}
          <Button 
            variant="secondary" 
            onClick={checkExistingBet} 
            disabled={isLoading}
          >
            Refresh
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Create new bet form
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Create a Bet</CardTitle>
        <CardDescription>Place a bet on this match using ICP's threshold ECDSA</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="amount">Amount</Label>
            <Input 
              id="amount" 
              type="number" 
              step="0.01" 
              min="0.01"
              value={amount} 
              onChange={(e) => setAmount(e.target.value)} 
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="token">Token</Label>
            <Select value={token} onValueChange={setToken}>
              <SelectTrigger id="token">
                <SelectValue placeholder="Select token" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ETH">ETH</SelectItem>
                {/* Add other tokens as needed */}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={handleCreateBet}
          disabled={isLoading || !isCreator}
        >
          {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          {isCreator ? 'Create Bet' : 'Only match creator can create bets'}
        </Button>
      </CardFooter>
    </Card>
  );
}