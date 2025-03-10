import { ethers } from 'ethers';

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
  private provider: ethers.BrowserProvider;
  private gameFactoryContract: ethers.Contract;
  private gameFactoryAddress: string;

  constructor() {
    if (typeof window.ethereum === 'undefined') {
      throw new Error('No Web3 provider detected');
    }
    
    this.provider = new ethers.BrowserProvider(window.ethereum);
    this.gameFactoryAddress = import.meta.env.VITE_GAME_FACTORY_ADDRESS || '';
    this.gameFactoryContract = new ethers.Contract(
      this.gameFactoryAddress,
      GAME_FACTORY_ABI,
      this.provider
    );
  }

  async connectWallet(): Promise<string> {
    try {
      const accounts = await this.provider.send('eth_requestAccounts', []);
      return accounts[0];
    } catch (error) {
      throw new Error('Failed to connect wallet');
    }
  }

  async createGame(betAmount: string, duration: number): Promise<string> {
    try {
      const signer = await this.provider.getSigner();
      const salt = ethers.randomBytes(32);
      const betAmountWei = ethers.parseEther(betAmount);
      
      const tx = await this.gameFactoryContract.connect(signer).createGame(
        salt,
        betAmountWei,
        duration,
        { value: betAmountWei }
      );
      
      const receipt = await tx.wait();
      const event = receipt.events.find((e: any) => e.event === 'GameCreated');
      return event.args.gameAddress;
    } catch (error) {
      throw new Error('Failed to create game');
    }
  }

  async joinGame(gameAddress: string, betAmount: string): Promise<void> {
    try {
      const signer = await this.provider.getSigner();
      const gameContract = new ethers.Contract(
        gameAddress,
        GAME_CONTRACT_ABI,
        signer
      );
      
      const betAmountWei = ethers.parseEther(betAmount);
      const tx = await gameContract.joinGame({ value: betAmountWei });
      await tx.wait();
    } catch (error) {
      throw new Error('Failed to join game');
    }
  }

  async declareWinner(gameAddress: string, winner: string): Promise<void> {
    try {
      const signer = await this.provider.getSigner();
      const gameContract = new ethers.Contract(
        gameAddress,
        GAME_CONTRACT_ABI,
        signer
      );
      
      const tx = await gameContract.declareWinner(winner);
      await tx.wait();
    } catch (error) {
      throw new Error('Failed to declare winner');
    }
  }
}

export const web3Service = new Web3Service();
