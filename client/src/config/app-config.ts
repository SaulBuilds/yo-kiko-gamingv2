/**
 * @file app-config.ts
 * @description Centralized configuration for the application
 * 
 * This file contains all the environment-specific configuration variables
 * that can be easily updated during deployment or between environments.
 */

// Base URL for the backend API
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// ICP Configuration - Internet Computer Protocol settings
export const ICP_CONFIG = {
  // Internet Identity URL - mainnet
  identityProviderUrl: import.meta.env.VITE_ICP_IDENTITY_PROVIDER_URL || 'https://identity.ic0.app',
    
  // GameBet Canister ID - required for production
  gameBetCanisterId: import.meta.env.VITE_GAME_BET_CANISTER_ID || '',
    
  // EVM RPC Canister ID - required for production
  evmRpcCanisterId: import.meta.env.VITE_EVM_RPC_CANISTER_ID || '',
    
  // Network host - IC mainnet
  host: import.meta.env.VITE_ICP_HOST || 'https://ic0.app',
};

// Ethereum Configuration - Web3 provider and network settings
export const ETH_CONFIG = {
  // Alchemy API key for Web3 provider
  alchemyApiKey: import.meta.env.VITE_ALCHEMY_API_KEY || '',
  
  // Ethereum network (mainnet, goerli, sepolia)
  network: import.meta.env.VITE_ETH_NETWORK || 'mainnet',
  
  // Primary currency symbol for displaying amounts
  currencySymbol: 'ETH',
  
  // Supported token contracts - addresses of ERC20 tokens that can be used for betting
  supportedTokens: {
    ETH: '0x0000000000000000000000000000000000000000',
    // Add other tokens as needed
  }
};

// WebSocket Configuration - For real-time updates
export const WS_CONFIG = {
  // Game state WebSocket path
  gameWsPath: '/game-ws',
  
  // ICP bets WebSocket path for real-time bet updates
  icpBetsWsPath: '/icp-bets-ws',
  
  // Reconnection settings
  reconnectInterval: 3000, // milliseconds
  maxReconnectAttempts: 5
};

// Feature Flags - enabling/disabling features without code changes
export const FEATURES = {
  // Enable ICP-based betting functionality
  enableICPBetting: import.meta.env.VITE_ENABLE_ICP_BETTING !== 'false',
  
  // Enable direct Ethereum-based betting 
  enableEthereumBetting: import.meta.env.VITE_ENABLE_ETH_BETTING !== 'false',
  
  // Enable Internet Computer Protocol authentication
  enableICPAuth: import.meta.env.VITE_ENABLE_ICP_AUTH !== 'false',
};

// App-wide Constants
export const APP_CONSTANTS = {
  // Minimum bet amount in ETH/tokens
  minimumBetAmount: 0.001,
  
  // Bet timeout period in seconds (24 hours)
  betTimeoutPeriod: 86400,
  
  // XP for daily login reward
  dailyRewardAmount: 100,
  
  // Match result wait time in seconds
  matchResultWaitTime: 600,
};