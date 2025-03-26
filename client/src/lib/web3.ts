import { createConfig, http } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { metaMask, walletConnect } from 'wagmi/connectors'

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID

if (!projectId) {
  throw new Error('Missing VITE_WALLETCONNECT_PROJECT_ID')
}

export const config = createConfig({
  chains: [mainnet, sepolia],
  connectors: [
    metaMask({
      shimDisconnect: true,
    }),
    walletConnect({
      projectId,
      showQrModal: true,
      metadata: {
        name: 'sumthn.fun',
        description: 'Crypto Gaming Platform',
        url: window.location.origin,
        icons: ['https://wagmi.sh/icon.png']
      },
    }),
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});

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