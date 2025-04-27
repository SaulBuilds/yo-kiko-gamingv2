/**
 * @file app-config.ts
 * @description Centralized configuration for the application
 * 
 * This file contains all the environment-specific configuration variables
 * that can be easily updated during deployment or between environments.
 */

// Base URL for the backend API
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// ICP Configuration
export const ICP_CONFIG = {
  // Internet Identity URL - mainnet or local
  identityProviderUrl: import.meta.env.VITE_ICP_IDENTITY_PROVIDER_URL || 
    'https://identity.ic0.app',
    
  // GameBet Canister ID - replace with actual canister ID after deployment
  gameBetCanisterId: import.meta.env.VITE_GAME_BET_CANISTER_ID || 
    'rrkah-fqaaa-aaaaa-aaaaq-cai', // Placeholder for dev
    
  // EVM RPC Canister ID - replace with actual canister ID
  evmRpcCanisterId: import.meta.env.VITE_EVM_RPC_CANISTER_ID || 
    'bkyz2-fmaaa-aaaaa-qaaaq-cai', // Placeholder for dev
    
  // Network host - IC mainnet or local
  host: import.meta.env.VITE_ICP_HOST || 
    'https://ic0.app',
};

// WebSocket Configuration
export const WS_CONFIG = {
  // Game state WebSocket path
  gameWsPath: '/game-ws',
  
  // ICP bets WebSocket path
  icpBetsWsPath: '/icp-bets-ws',
};

// Feature Flags - enabling/disabling features without code changes
export const FEATURES = {
  enableICPBetting: import.meta.env.VITE_ENABLE_ICP_BETTING === 'true',
  enableEthereumBetting: import.meta.env.VITE_ENABLE_ETH_BETTING === 'true',
  enableICPAuth: import.meta.env.VITE_ENABLE_ICP_AUTH === 'true',
};

// App-wide Constants
export const APP_CONSTANTS = {
  minimumBetAmount: 0.001, // Minimum bet amount in ETH/tokens
  betTimeoutPeriod: 86400, // 24 hours in seconds
  dailyRewardAmount: 100, // XP for daily login
};