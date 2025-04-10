import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useMultiWallet } from '@/hooks/use-multi-wallet';
import { useAuth } from '@/hooks/use-auth';
import { Wallet } from 'lucide-react';
import { ICPBetButton } from './icp-bet-button';
import { ETHBetButton } from './eth-bet-button';
import { Separator } from '@/components/ui/separator';
import { ConnectWallet } from '@/components/connect-wallet';

interface WalletBasedBetUIProps {
  gameId: string;
  matchId?: string;
  onBetPlaced?: (walletType: string, amount: string) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * WalletBasedBetUI component
 * A UI component that shows different betting options based on the connected wallet
 * 
 * @param {WalletBasedBetUIProps} props - Component props
 * @returns {JSX.Element} The wallet-based betting UI component
 */
export function WalletBasedBetUI({
  gameId,
  matchId,
  onBetPlaced,
  disabled = false,
  className
}: WalletBasedBetUIProps) {
  const { activeWalletType, isConnected } = useMultiWallet();
  const { user } = useAuth();
  const [xpBetAmount, setXpBetAmount] = useState(100);

  // Handler for bet confirmation
  const handleBetConfirmed = (walletType: string, amount: string) => {
    console.log(`Bet confirmed: ${amount} ${walletType}`);
    if (onBetPlaced) {
      onBetPlaced(walletType, amount);
    }
  };

  // Handle XP betting (available for all wallet types)
  const handleXPBet = () => {
    console.log(`Placing XP bet of ${xpBetAmount} for game ${gameId}`);
    handleBetConfirmed('XP', xpBetAmount.toString());
  };

  if (!isConnected || !user) {
    return (
      <div className={`p-4 border rounded-lg ${className}`}>
        <h3 className="text-lg font-medium mb-4">Place a Bet</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Connect your wallet to place bets on this game.
        </p>
        <ConnectWallet />
      </div>
    );
  }

  return (
    <div className={`p-4 border rounded-lg ${className}`}>
      <h3 className="text-lg font-medium">Place a Bet</h3>
      
      <div className="space-y-4 mt-4">
        {/* XP Betting - Available for all wallet types */}
        <div>
          <h4 className="text-sm font-medium mb-2">Bet with XP</h4>
          <div className="flex space-x-2">
            {[100, 200, 500, 1000].map((amount) => (
              <Button
                key={amount}
                variant={xpBetAmount === amount ? "default" : "outline"}
                size="sm"
                onClick={() => setXpBetAmount(amount)}
                className="flex-1"
              >
                {amount} XP
              </Button>
            ))}
          </div>
          <Button 
            onClick={handleXPBet} 
            className="w-full mt-2"
            disabled={disabled}
          >
            Bet {xpBetAmount} XP
          </Button>
        </div>
        
        <Separator />
        
        {/* Crypto Betting - Different options based on wallet type */}
        <div>
          <h4 className="text-sm font-medium mb-2">Bet with Crypto</h4>
          
          <div className="space-y-2">
            {/* Show both options with prominence based on active wallet */}
            <div className="grid grid-cols-2 gap-2">
              {activeWalletType === 'abstract' ? (
                // Abstract wallet is active, show ETH betting prominently
                <>
                  <ETHBetButton
                    gameId={gameId}
                    matchId={matchId}
                    disabled={disabled}
                    onBetConfirmed={(amount) => handleBetConfirmed('ETH', amount)}
                    className="w-full"
                  />
                  <ICPBetButton 
                    gameId={gameId}
                    matchId={matchId}
                    disabled={true} // Always disabled for Abstract wallet users
                    onBetConfirmed={(amount) => handleBetConfirmed('ICP', amount)}
                    className="w-full opacity-50"
                  />
                </>
              ) : activeWalletType === 'nfid' ? (
                // NFID wallet is active, show ICP betting prominently
                <>
                  <ETHBetButton
                    gameId={gameId}
                    matchId={matchId}
                    disabled={true} // Always disabled for NFID wallet users
                    onBetConfirmed={(amount) => handleBetConfirmed('ETH', amount)}
                    className="w-full opacity-50"
                  />
                  <ICPBetButton 
                    gameId={gameId}
                    matchId={matchId}
                    disabled={disabled}
                    onBetConfirmed={(amount) => handleBetConfirmed('ICP', amount)}
                    className="w-full"
                  />
                </>
              ) : (
                // No specific wallet active, show both options
                <>
                  <ETHBetButton
                    gameId={gameId}
                    matchId={matchId}
                    disabled={disabled}
                    onBetConfirmed={(amount) => handleBetConfirmed('ETH', amount)}
                    className="w-full"
                  />
                  <ICPBetButton 
                    gameId={gameId}
                    matchId={matchId}
                    disabled={disabled}
                    onBetConfirmed={(amount) => handleBetConfirmed('ICP', amount)}
                    className="w-full"
                  />
                </>
              )}
            </div>
            
            {!activeWalletType && (
              <p className="text-xs text-muted-foreground mt-2">
                Connect with Abstract or NFID to place crypto bets.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}