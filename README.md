# Yokiko Gaming Platform

## Overview

The Yokiko Gaming Platform is a cutting-edge Web3 gaming ecosystem that combines traditional web gaming experiences with blockchain technology. The platform allows users to play various games, place skill-based wagers, and connect their Web3 wallets for seamless cryptocurrency integration.

## Features

- **Multiple Game Types**: Tetris Battle, Temple Runner, Street Fighter, and more coming soon
- **Multi-chain Authentication**:
  - Connect via Abstract Global Wallet for Ethereum
  - Use Internet Identity for ICP with device fingerprinting
- **Cross-chain Betting System**: 
  - Place bets using ETH, XP, or other tokens
  - Internet Computer's threshold ECDSA for cross-chain transactions
- **Real-time Updates**: WebSocket integration for live game and bet status
- **Leaderboards**: Track top players and performances across all games
- **Creator Applications**: Submit your games to the platform
- **Device-specific User Accounts**: Enhanced security through device fingerprinting

## Technology Stack

- **Frontend**: React, TypeScript, TailwindCSS, shadcn/ui
- **Backend**: Node.js, Express, PostgreSQL, WebSockets
- **Blockchain**: 
  - Ethereum Smart Contracts, Solidity
  - Internet Computer Protocol (ICP), Motoko
  - ICP-ETH Bridge via Threshold ECDSA
- **Authentication**:
  - Internet Identity with device fingerprinting
  - Web3/Ethereum wallet connections
- **Testing**: Jest, React Testing Library
- **Deployment**: Replit, Internet Computer mainnet
## Getting Started

### Prerequisites

- Node.js v18+
- PostgreSQL database
- Git

### Installation

1. Clone the repository
2. Run dependency installation:
   ```
   npm install
   ```
3. Copy `.env.example` to `.env` and configure the environment variables
4. Initialize the database:
   ```
   npm run db:push
   ```

### Running the Application

1. Start the development server:
   ```
   npm run dev
   ```
2. Navigate to localhost:5000 in your browser

### Deploying to Internet Computer

For production deployment on the Internet Computer:

1. Install the DFINITY Canister SDK (DFX):
   ```
   sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"
   ```

2. Deploy the ICP canisters:
   ```
   cd icp-project
   dfx deploy --network ic
   ```

3. Update your environment variables with the deployed canister IDs:
   ```
   VITE_GAME_BET_CANISTER_ID=<your-gameBet-canister-id>
   VITE_EVM_RPC_CANISTER_ID=<evm-rpc-canister-id>
   ```

## Testing

The project includes a comprehensive test suite using Jest and React Testing Library.

### Running Tests

- Run all tests: npm run test
- Run tests with coverage: npm run test:coverage
- Run linting: npm run lint
- Run formatting: npm run format

## Project Structure

- client/: Frontend code
  - public/: Static assets
  - src/: React source code
    - components/: UI components
      - game/: Game-specific components including icp-bet-widget.tsx
      - wallet/: Wallet connection components including ICP integration
    - config/: Application configuration
    - hooks/: Custom React hooks
    - lib/: Utility functions
      - device-fingerprint.ts: Device identification for ICP auth
      - icp-eth-bridge.ts: Integration with ICP canisters
    - pages/: Page components
    - types/: TypeScript type definitions
    - __tests__/: Frontend tests
- contracts/: Smart contracts
  - GameBets.sol: Ethereum smart contract for betting
  - icp-eth/: ICP integration contracts
    - GameBetCanister.mo: Motoko canister for cross-chain betting
- documentation/: Project documentation
- icp-project/: Internet Computer canister development
  - dfx.json: Canister configuration
  - src/: Canister source code and declarations
- server/: Backend code
  - WebSocket handlers for real-time updates
- shared/: Shared code between frontend and backend

## Game Types

### Tetris Battle

A real-time competitive version of the classic Tetris game. Players can challenge each other, with the winner determined by score, level progression, and line clearing efficiency.

### Temple Runner

An endless runner game where players navigate through ancient temples, collecting coins and avoiding obstacles. The longer you survive and the more coins you collect, the higher your score.

### Street Fighter

A classic arcade fighting game with original moves and characters. Players select characters with different abilities and compete in matches.

### Coming Soon Games

- **Crypto Chess**: Strategic chess gameplay with blockchain-based tournaments and ratings.
- **Web3 Poker**: Texas Hold'em poker with decentralized card shuffling and secure betting.
- **Blockchain Racing**: High-octane racing with NFT vehicles and customizable tracks.

## Blockchain Integration

The platform integrates with multiple blockchain technologies for:

1. **Secure Betting**: Smart contracts ensure transparent and tamper-proof betting
2. **Wallet Connections**: Connect your Web3 wallet (Ethereum) or Internet Identity (ICP) to participate
3. **Transaction History**: All bets and payouts are recorded on the blockchain
4. **Cross-Chain Functionality**: Place bets using ETH through ICP's threshold ECDSA

### Internet Computer Protocol Integration

The platform leverages the Internet Computer Protocol (ICP) for enhanced functionality:

1. **GameBet Canister**: A dedicated canister for managing bets across chains
2. **Device Fingerprinting**: Security enhancement for Internet Identity authentication
3. **Chain Fusion**: Use ICP's threshold ECDSA to interact with Ethereum and other EVM chains
4. **WebSocket Updates**: Real-time bet status changes and notifications

## Testing Strategy

The project uses a comprehensive testing approach including:

1. **Unit Tests**: Testing individual components and functions
2. **Integration Tests**: Testing interactions between different parts of the system
3. **End-to-End Tests**: Testing complete user flows
4. **Smart Contract Tests**: Verifying the correctness of blockchain interactions

See the [Testing Documentation](documentation/testing.md) for details.

## Roadmap

Check out our [roadmap](documentation/todo_and_backlog.md) for upcoming features and improvements.

## License

[MIT License](LICENSE)
