/**
 * @file icp-eth-bridge.ts
 * @description Utility functions for interacting with Internet Computer's EVM RPC canister and our Game Bet canister
 */

import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Principal } from '@dfinity/principal';
import { Actor, HttpAgent } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';
import { getOrCreateDeviceFingerprint } from './device-fingerprint';

// Import configuration from centralized config file
import { ICP_CONFIG } from '@/config/app-config';

// Use canister IDs from config
const GAME_BET_CANISTER_ID = ICP_CONFIG.gameBetCanisterId;
const EVM_RPC_CANISTER_ID = ICP_CONFIG.evmRpcCanisterId;

// Interface for the GameBetCanister methods
interface GameBetCanister {
  createBet: (matchId: bigint, tokenAddress: string, receiver: string, amount: bigint) => Promise<{ ok: string } | { err: string }>;
  acceptBet: (matchId: bigint) => Promise<{ ok: string } | { err: string }>;
  payoutBet: (matchId: bigint, winner: string) => Promise<{ ok: string } | { err: string }>;
  getBet: (matchId: bigint) => Promise<GameBet | null>;
  getEthereumAddress: () => Promise<string>;
}

// Type for a GameBet
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

// Cache for Actor instance to avoid multiple initializations
let gameBetCanisterActor: GameBetCanister | null = null;

/**
 * Initializes the GameBetCanister actor
 * @returns The GameBetCanister actor with methods to interact with the canister
 */
export async function initGameBetCanister(): Promise<GameBetCanister> {
  // Return cached actor if available
  if (gameBetCanisterActor) {
    return gameBetCanisterActor;
  }

  try {
    // Create an authentication client
    const authClient = await AuthClient.create({
      idleOptions: {
        disableIdle: true,
      },
    });

    let agent;
    
    // Check if user is already authenticated
    if (await authClient.isAuthenticated()) {
      const identity = authClient.getIdentity();
      agent = new HttpAgent({ 
        identity,
        host: ICP_CONFIG.host 
      });
    } else {
      // Create a new anonymous identity
      agent = new HttpAgent({
        host: ICP_CONFIG.host
      });
    }

    // In local development, we need to fetch the root key
    if (import.meta.env.DEV) {
      await agent.fetchRootKey();
    }

    // The interface of the GameBetCanister
    // This would be auto-generated from the Candid file in a real project
    const gameBetCanisterIdl = ({ IDL }: any) => {
      const Result = IDL.Variant({
        ok: IDL.Text,
        err: IDL.Text,
      });
      
      const GameBet = IDL.Record({
        matchId: IDL.Nat,
        player1: IDL.Text,
        player2: IDL.Opt(IDL.Text),
        amount: IDL.Nat,
        timestamp: IDL.Int,
        token_address: IDL.Text,
        is_active: IDL.Bool,
        is_paid: IDL.Bool,
      });
      
      return IDL.Service({
        getEthereumAddress: IDL.Func([], [IDL.Text], []),
        createBet: IDL.Func([IDL.Nat, IDL.Text, IDL.Text, IDL.Nat], [Result], []),
        acceptBet: IDL.Func([IDL.Nat], [Result], []),
        payoutBet: IDL.Func([IDL.Nat, IDL.Text], [Result], []),
        getBet: IDL.Func([IDL.Nat], [IDL.Opt(GameBet)], ['query']),
      });
    };

    // Create the actor
    gameBetCanisterActor = Actor.createActor<GameBetCanister>(
      gameBetCanisterIdl,
      {
        agent,
        canisterId: Principal.fromText(GAME_BET_CANISTER_ID),
      },
    );

    return gameBetCanisterActor;
  } catch (error) {
    console.error('Error initializing GameBetCanister:', error);
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
  amount: number,
  tokenAddress: string,
  receiverAddress: string,
): Promise<string> {
  try {
    const canister = await initGameBetCanister();
    const result = await canister.createBet(
      BigInt(matchId),
      tokenAddress,
      receiverAddress,
      BigInt(amount),
    );

    if ('err' in result) {
      throw new Error(`Failed to create bet: ${result.err}`);
    }

    return result.ok;
  } catch (error) {
    console.error('Error creating bet with ICP:', error);
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
    const canister = await initGameBetCanister();
    const result = await canister.acceptBet(BigInt(matchId));

    if ('err' in result) {
      throw new Error(`Failed to accept bet: ${result.err}`);
    }

    return result.ok;
  } catch (error) {
    console.error('Error accepting bet with ICP:', error);
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
  winnerAddress: string,
): Promise<string> {
  try {
    const canister = await initGameBetCanister();
    const result = await canister.payoutBet(
      BigInt(matchId),
      winnerAddress,
    );

    if ('err' in result) {
      throw new Error(`Failed to payout bet: ${result.err}`);
    }

    return result.ok;
  } catch (error) {
    console.error('Error paying out bet with ICP:', error);
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
    const canister = await initGameBetCanister();
    return await canister.getBet(BigInt(matchId));
  } catch (error) {
    console.error('Error getting bet with ICP:', error);
    throw error;
  }
}

/**
 * Get the Ethereum address associated with the GameBetCanister
 * @returns Ethereum address as a string
 */
export async function getCanisterEthereumAddress(): Promise<string> {
  try {
    const canister = await initGameBetCanister();
    return await canister.getEthereumAddress();
  } catch (error) {
    console.error('Error getting canister Ethereum address:', error);
    throw error;
  }
}

/**
 * Hook for accessing ICP-ETH bridge functionality with toast notifications
 */
export function useICPEthBridge() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const createBet = async (
    matchId: number,
    amount: number,
    tokenAddress: string,
    receiverAddress: string,
  ): Promise<string> => {
    setIsLoading(true);
    try {
      const txHash = await createBetWithICP(
        matchId,
        amount,
        tokenAddress,
        receiverAddress,
      );
      return txHash;
    } catch (error) {
      console.error('Error creating bet:', error);
      toast({
        title: 'Error Creating Bet',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const acceptBet = async (matchId: number): Promise<string> => {
    setIsLoading(true);
    try {
      const txHash = await acceptBetWithICP(matchId);
      return txHash;
    } catch (error) {
      console.error('Error accepting bet:', error);
      toast({
        title: 'Error Accepting Bet',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const payoutWinner = async (
    matchId: number,
    winnerAddress: string,
  ): Promise<string> => {
    setIsLoading(true);
    try {
      const txHash = await payoutBetWithICP(matchId, winnerAddress);
      return txHash;
    } catch (error) {
      console.error('Error paying out bet:', error);
      toast({
        title: 'Error Processing Payout',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getBet = async (matchId: number): Promise<GameBet | null> => {
    setIsLoading(true);
    try {
      return await getBetWithICP(matchId);
    } catch (error) {
      console.error('Error getting bet details:', error);
      toast({
        title: 'Error Fetching Bet',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createBet,
    acceptBet,
    payoutWinner,
    getBet,
    isLoading,
  };
}