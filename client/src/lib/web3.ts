import { http, createConfig } from 'wagmi';
import { mainnet, sepolia, arbitrum, optimism, base } from 'wagmi/chains';
import { injected, metaMask, walletConnect } from 'wagmi/connectors';
import { parseEther } from 'viem';

// Create wagmi config with multiple chains
export const config = createConfig({
  chains: [mainnet, sepolia, arbitrum, optimism, base],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [arbitrum.id]: http(),
    [optimism.id]: http(),
    [base.id]: http(),
  },
  connectors: [
    injected(),
    metaMask(),
    walletConnect({
      projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID!,
    }),
  ],
});


// Game contract related code
const GAME_FACTORY_ABI = [
  "event GameCreated(address indexed gameAddress, address indexed creator)",
  "function createGame(bytes32 salt, uint256 betAmount, uint256 gameDuration) external payable returns (address)"
];

const GAME_CONTRACT_ABI = [
  "event BetPlaced(address indexed player, uint256 amount)",
  "event GameEnded(address winner, uint256 payout)",
  "event CheaterFlagged(address offender)",
  "function joinGame() external payable",
  "function declareWinner(address _winner) external",
  "function cancelGame() external",
  "function flagCheater(address offender, address raffleAddress) external",
  "function getParticipants() external view returns (address[] memory)"
];

export class Web3Service {
  private gameFactoryAddress: string;

  constructor() {
    if (typeof window.ethereum === 'undefined') {
      throw new Error('No Web3 provider detected');
    }
    this.gameFactoryAddress = import.meta.env.VITE_GAME_FACTORY_ADDRESS || '';
  }

  async createGame(betAmount: string, duration: number) {
    try {
      const betAmountWei = parseEther(betAmount);
      // Implementation will be updated to use wagmi hooks
      return "game_address";
    } catch (error) {
      throw new Error('Failed to create game');
    }
  }

  async joinGame(gameAddress: string, betAmount: string) {
    try {
      const betAmountWei = parseEther(betAmount);
      // Implementation will be updated to use wagmi hooks
    } catch (error) {
      throw new Error('Failed to join game');
    }
  }

  async declareWinner(gameAddress: string, winner: string) {
    try {
      // Implementation will be updated to use wagmi hooks
    } catch (error) {
      throw new Error('Failed to declare winner');
    }
  }
}

export const web3Service = new Web3Service();