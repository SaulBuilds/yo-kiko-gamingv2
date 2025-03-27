# Yokiko Gaming Platform

## Overview

The Yokiko Gaming Platform is a cutting-edge Web3 gaming ecosystem that combines traditional web gaming experiences with blockchain technology. The platform allows users to play various games, place skill-based wagers, and connect their Web3 wallets for seamless cryptocurrency integration.

## Features

- **Multiple Game Types**: Tetris Battle, Temple Runner, Street Fighter, and more coming soon
- **Web3 Wallet Integration**: Connect via Abstract Global Wallet
- **Skill-based Wagering**: Place bets on games with XP or cryptocurrency
- **Blockchain Integration**: Smart contracts for secure betting
- **Leaderboards**: Track top players and performances
- **Creator Applications**: Submit your games to the platform

## Technology Stack

- **Frontend**: React, TypeScript, TailwindCSS, shadcn/ui
- **Backend**: Node.js, Express, PostgreSQL, WebSockets
- **Blockchain**: Ethereum Smart Contracts, Solidity
- **Testing**: Jest, React Testing Library
- **Deployment**: Replit
## Getting Started

### Prerequisites

- Node.js v18+
- PostgreSQL database
- Git

### Installation

1. Clone the repository
2. Run dependency installation
3. Set up environment variables
4. Initialize the database

### Running the Application

1. Start the development server
2. Navigate to localhost:5000 in your browser

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
    - hooks/: Custom React hooks
    - lib/: Utility functions
    - pages/: Page components
    - types/: TypeScript type definitions
    - __tests__/: Frontend tests
- contracts/: Smart contracts
- documentation/: Project documentation
- server/: Backend code
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

The platform integrates with blockchain technologies for:

1. **Secure Betting**: Smart contracts ensure transparent and tamper-proof betting
2. **Wallet Connections**: Connect your web3 wallet to participate in cryptocurrency wagers
3. **Transaction History**: All bets and payouts are recorded on the blockchain

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
