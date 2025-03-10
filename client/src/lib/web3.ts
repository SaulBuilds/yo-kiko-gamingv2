import { createConfig, http } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { metaMask, walletConnect } from 'wagmi/connectors'

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID

if (!projectId) {
  throw new Error('Missing VITE_WALLETCONNECT_PROJECT_ID')
}

// Get the window object safely
const windowObj = typeof window !== 'undefined' ? window : { location: { host: '' } };

export const config = createConfig({
  chains: [mainnet, sepolia],
  connectors: [
    metaMask(),
    walletConnect({
      projectId,
      showQrModal: true,
      metadata: {
        name: 'Crypto Gaming Platform',
        description: 'Play arcade games and win crypto',
        url: windowObj.location.host,
        icons: ['https://wagmi.sh/icon.png']
      }
    }),
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
})

// Game contract ABIs
export const GAME_FACTORY_ABI = [
  "event GameCreated(address indexed gameAddress, address indexed creator)",
  "function createGame(bytes32 salt, uint256 betAmount, uint256 gameDuration) external payable returns (address)"
] as const;

export const GAME_CONTRACT_ABI = [
  "event BetPlaced(address indexed player, uint256 amount)",
  "event GameEnded(address winner, uint256 payout)",
  "event CheaterFlagged(address offender)",
  "function joinGame() external payable",
  "function declareWinner(address _winner) external",
  "function cancelGame() external",
  "function flagCheater(address offender, address raffleAddress) external",
  "function getParticipants() external view returns (address[] memory)"
] as const;

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
      const betAmountWei =  betAmount; 
      return "game_address";
    } catch (error) {
      throw new Error('Failed to create game');
    }
  }

  async joinGame(gameAddress: string, betAmount: string) {
    try {
      const betAmountWei = betAmount; 
    } catch (error) {
      throw new Error('Failed to join game');
    }
  }

  async declareWinner(gameAddress: string, winner: string) {
    try {
    } catch (error) {
      throw new Error('Failed to declare winner');
    }
  }
}

export const web3Service = new Web3Service();