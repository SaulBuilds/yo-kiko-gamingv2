/**
 * @file icp-eth-bridge.ts
 * @description Utility functions for interacting with Internet Computer's EVM RPC canister and our Game Bet canister
 */

import { Actor, HttpAgent } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { ethers } from 'ethers';
import { useToast } from '@/hooks/use-toast';

// ICP canister IDs - these would be the actual deployed canister IDs
const GAME_BET_CANISTER_ID = 'your-canister-id-here';
const EVM_RPC_CANISTER_ID = '7hfb6-caaaa-aaaar-qadga-cai'; // Mainnet EVM RPC canister ID

// GameBetCanister interface definition
interface GameBetCanister {
  createBet: (matchId: bigint, tokenAddress: string, receiver: string, amount: bigint) => Promise<{ ok: string } | { err: string }>;
  acceptBet: (matchId: bigint) => Promise<{ ok: string } | { err: string }>;
  payoutBet: (matchId: bigint, winner: string) => Promise<{ ok: string } | { err: string }>;
  getBet: (matchId: bigint) => Promise<GameBet | null>;
  getEthereumAddress: () => Promise<string>;
}

// Bet structure matching the Motoko definition
interface GameBet {
  matchId: bigint;
  player1: string;
  player2: [string] | [];
  amount: bigint;
  timestamp: bigint;
  token_address: string;
  is_active: boolean;
  is_paid: boolean;
}

/**
 * Initializes the GameBetCanister actor
 * @returns The GameBetCanister actor with methods to interact with the canister
 */
export async function initGameBetCanister(): Promise<GameBetCanister> {
  try {
    const agent = new HttpAgent({
      host: process.env.NODE_ENV === 'production' 
        ? 'https://ic0.app' 
        : 'http://localhost:8000',
    });

    // For development only
    if (process.env.NODE_ENV !== 'production') {
      await agent.fetchRootKey();
    }

    // Here we would normally use idlFactory for the canister
    // For the demo, we'll create a mock interface
    const actor = Actor.createActor<GameBetCanister>(
      // idlFactory would go here
      {} as any,
      {
        agent,
        canisterId: GAME_BET_CANISTER_ID,
      }
    );

    return actor;
  } catch (error) {
    console.error('Failed to initialize GameBetCanister actor:', error);
    throw error;
  }
}

/**
 * Create a bet for a specific game match using ICP's threshold ECDSA
 * @param matchId - The game match ID
 * @param amount - The bet amount in wei
 * @param tokenAddress - The token address (use 0x0 for ETH)
 * @param receiverAddress - The recipient Ethereum address
 * @returns Transaction hash if successful
 */
export async function createBetWithICP(
  matchId: number,
  amount: string,
  tokenAddress: string = '0x0',
  receiverAddress: string
): Promise<string> {
  try {
    const gameBetCanister = await initGameBetCanister();
    
    // Convert amount to bigint for ICP
    const amountBigInt = BigInt(amount);
    const matchIdBigInt = BigInt(matchId);
    
    // Call the canister method
    const result = await gameBetCanister.createBet(
      matchIdBigInt,
      tokenAddress,
      receiverAddress,
      amountBigInt
    );

    if ('ok' in result) {
      return result.ok;
    } else {
      throw new Error(result.err);
    }
  } catch (error) {
    console.error('Failed to create bet with ICP:', error);
    throw error;
  }
}

/**
 * Accept a bet for a specific game match
 * @param matchId - The game match ID
 * @returns Transaction hash if successful
 */
export async function acceptBetWithICP(matchId: number): Promise<string> {
  try {
    const gameBetCanister = await initGameBetCanister();
    const matchIdBigInt = BigInt(matchId);
    
    // Call the canister method
    const result = await gameBetCanister.acceptBet(matchIdBigInt);
    
    if ('ok' in result) {
      return result.ok;
    } else {
      throw new Error(result.err);
    }
  } catch (error) {
    console.error('Failed to accept bet with ICP:', error);
    throw error;
  }
}

/**
 * Pay out a bet to the winner
 * @param matchId - The game match ID
 * @param winnerAddress - The Ethereum address of the winner
 * @returns Transaction hash if successful
 */
export async function payoutBetWithICP(
  matchId: number,
  winnerAddress: string
): Promise<string> {
  try {
    const gameBetCanister = await initGameBetCanister();
    const matchIdBigInt = BigInt(matchId);
    
    // Call the canister method
    const result = await gameBetCanister.payoutBet(matchIdBigInt, winnerAddress);
    
    if ('ok' in result) {
      return result.ok;
    } else {
      throw new Error(result.err);
    }
  } catch (error) {
    console.error('Failed to payout bet with ICP:', error);
    throw error;
  }
}

/**
 * Get details of a bet for a specific match
 * @param matchId - The game match ID
 * @returns Bet details or null if not found
 */
export async function getBetWithICP(matchId: number): Promise<GameBet | null> {
  try {
    const gameBetCanister = await initGameBetCanister();
    const matchIdBigInt = BigInt(matchId);
    
    // Call the canister method
    return await gameBetCanister.getBet(matchIdBigInt);
  } catch (error) {
    console.error('Failed to get bet with ICP:', error);
    throw error;
  }
}

/**
 * Get the Ethereum address associated with the GameBetCanister
 * @returns Ethereum address as a string
 */
export async function getCanisterEthereumAddress(): Promise<string> {
  try {
    const gameBetCanister = await initGameBetCanister();
    return await gameBetCanister.getEthereumAddress();
  } catch (error) {
    console.error('Failed to get canister Ethereum address:', error);
    throw error;
  }
}

/**
 * Hook for accessing ICP-ETH bridge functionality with toast notifications
 */
export function useICPEthBridge() {
  const { toast } = useToast();

  const createBet = async (
    matchId: number,
    amount: string,
    tokenAddress: string,
    receiverAddress: string
  ) => {
    try {
      toast({
        title: 'Creating bet...',
        description: 'Please wait while we process your transaction',
      });
      
      const result = await createBetWithICP(matchId, amount, tokenAddress, receiverAddress);
      
      toast({
        title: 'Bet created successfully',
        description: `Transaction ID: ${result.slice(0, 20)}...`,
      });
      
      return result;
    } catch (error) {
      toast({
        title: 'Failed to create bet',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const acceptBet = async (matchId: number) => {
    try {
      toast({
        title: 'Accepting bet...',
        description: 'Please wait while we process your transaction',
      });
      
      const result = await acceptBetWithICP(matchId);
      
      toast({
        title: 'Bet accepted successfully',
        description: `Transaction ID: ${result.slice(0, 20)}...`,
      });
      
      return result;
    } catch (error) {
      toast({
        title: 'Failed to accept bet',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const payoutBet = async (matchId: number, winnerAddress: string) => {
    try {
      toast({
        title: 'Paying out bet...',
        description: 'Please wait while we process your transaction',
      });
      
      const result = await payoutBetWithICP(matchId, winnerAddress);
      
      toast({
        title: 'Bet paid out successfully',
        description: `Transaction ID: ${result.slice(0, 20)}...`,
      });
      
      return result;
    } catch (error) {
      toast({
        title: 'Failed to pay out bet',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
      throw error;
    }
  };

  return {
    createBet,
    acceptBet,
    payoutBet,
    getBet: getBetWithICP,
    getCanisterAddress: getCanisterEthereumAddress,
  };
}