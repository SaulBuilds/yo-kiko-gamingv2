import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useICPEthBridge } from '@/lib/icp-eth-bridge';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ICPBetWidgetProps {
  matchId: number;
  opponentAddress?: string;
  gameType: 'tetris' | 'temple-runner' | 'trench-fighter';
}

export function ICPBetWidget({ matchId, opponentAddress, gameType }: ICPBetWidgetProps) {
  const { user } = useAuth();
  const { createBet, acceptBet, getBet, getCanisterAddress } = useICPEthBridge();
  
  const [amount, setAmount] = useState<string>('0.01');
  const [tokenAddress, setTokenAddress] = useState<string>('0x0'); // Default to ETH
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [isAccepting, setIsAccepting] = useState<boolean>(false);
  const [betExists, setBetExists] = useState<boolean>(false);
  const [canisterAddress, setCanisterAddress] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Check if a bet already exists for this match
  useEffect(() => {
    const checkExistingBet = async () => {
      try {
        const bet = await getBet(matchId);
        if (bet) {
          setBetExists(true);
        }
      } catch (err) {
        console.error('Failed to check for existing bet:', err);
      }
    };
    
    const getAddress = async () => {
      try {
        const address = await getCanisterAddress();
        setCanisterAddress(address);
      } catch (err) {
        console.error('Failed to get canister address:', err);
      }
    };
    
    checkExistingBet();
    getAddress();
  }, [matchId, getBet, getCanisterAddress]);
  
  const handleCreateBet = async () => {
    if (!user) {
      setError('You must be logged in to create a bet');
      return;
    }
    
    setError(null);
    setSuccess(null);
    setIsCreating(true);
    
    try {
      // For demo purposes, we're using a fixed opponent address if not provided
      const receiver = opponentAddress || '0xOpponentAddress';
      
      // Convert ETH to Wei for the amount
      const amountInWei = (parseFloat(amount) * 1e18).toString();
      
      const result = await createBet(
        matchId,
        amountInWei,
        tokenAddress,
        receiver
      );
      
      setSuccess(`Bet created successfully! Transaction ID: ${result.slice(0, 10)}...`);
      setBetExists(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create bet');
    } finally {
      setIsCreating(false);
    }
  };
  
  const handleAcceptBet = async () => {
    if (!user) {
      setError('You must be logged in to accept a bet');
      return;
    }
    
    setError(null);
    setSuccess(null);
    setIsAccepting(true);
    
    try {
      const result = await acceptBet(matchId);
      setSuccess(`Bet accepted successfully! Transaction ID: ${result.slice(0, 10)}...`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept bet');
    } finally {
      setIsAccepting(false);
    }
  };
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Bet with Internet Computer</CardTitle>
        <CardDescription>
          Create or accept a bet using ICP's EVM integration
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert className="bg-green-50 border-green-200 text-green-800">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="game-type">Game Type</Label>
          <Input id="game-type" value={gameType} disabled />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="match-id">Match ID</Label>
          <Input id="match-id" value={matchId.toString()} disabled />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="canister-address">Canister Ethereum Address</Label>
          <Input id="canister-address" value={canisterAddress || 'Loading...'} disabled />
        </div>
        
        {!betExists ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="amount">Bet Amount</Label>
              <div className="flex space-x-2">
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={isCreating}
                />
                <Select 
                  onValueChange={(value) => setTokenAddress(value)} 
                  defaultValue={tokenAddress}
                  disabled={isCreating}
                >
                  <SelectTrigger className="w-1/3">
                    <SelectValue placeholder="Token" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0x0">ETH</SelectItem>
                    <SelectItem value="0xTokenAddress1">USDC</SelectItem>
                    <SelectItem value="0xTokenAddress2">DAI</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Button 
              onClick={handleCreateBet} 
              className="w-full" 
              disabled={isCreating}
            >
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Bet...
                </>
              ) : (
                'Create Bet with Internet Computer'
              )}
            </Button>
          </>
        ) : (
          <Button 
            onClick={handleAcceptBet} 
            className="w-full" 
            disabled={isAccepting}
          >
            {isAccepting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Accepting Bet...
              </>
            ) : (
              'Accept Bet with Internet Computer'
            )}
          </Button>
        )}
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        <p>
          Bets are processed using ICP's chain fusion capabilities with threshold ECDSA for secure Ethereum transactions.
        </p>
      </CardFooter>
    </Card>
  );
}