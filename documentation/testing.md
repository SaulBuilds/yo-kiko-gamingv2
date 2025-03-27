# Testing Documentation

This document outlines the testing strategy for the Yokiko Gaming Platform, including existing tests, planned tests, and best practices for implementing tests.

## Testing Framework

The project uses the following testing tools:

- **Jest**: Primary testing framework
- **React Testing Library**: For testing React components
- **MSW (Mock Service Worker)**: For mocking API requests during tests
- **ts-jest**: TypeScript support for Jest

## Test Types

### 1. Unit Tests

Unit tests focus on testing small, isolated units of code like individual functions or components.

#### Existing Unit Tests:

- `client/src/__tests__/components/button.test.tsx`: Tests for the Button component
- `client/src/__tests__/hooks/use-auth.test.tsx`: Tests for the auth hook

#### Planned Unit Tests:

- **Components:**
  - `Avatar.test.tsx`: Test avatar rendering with different images and fallback initials
  - `Card.test.tsx`: Test card component with various content types
  - `Dialog.test.tsx`: Test dialog open/close functionality and content rendering
  - `Navbar.test.tsx`: Test navigation links and responsive behavior
  - `BetModal.test.tsx`: Test bet amount inputs and validation
  - `GameBoard.test.tsx`: Test game board rendering and state updates
  - `ScoreAnimation.test.tsx`: Test animation triggers and completions

- **Hooks:**
  - `use-mobile.test.tsx`: Test responsive detection
  - `use-toast.test.tsx`: Test toast notifications
  
- **Utils:**
  - `utils.test.ts`: Test utility functions
  - `web3.test.ts`: Test blockchain connection utilities

### 2. Integration Tests

Integration tests verify that different parts of the application work correctly together.

#### Planned Integration Tests:

- **Page Integration:**
  - `game-page.test.tsx`: Test game loading, state management, and scoring
  - `dashboard-page.test.tsx`: Test leaderboard display and profile information
  - `auth-page.test.tsx`: Test authentication flow

- **API Integration:**
  - `api-game.test.ts`: Test game data fetching and updates
  - `api-user.test.ts`: Test user profile operations
  - `api-leaderboard.test.ts`: Test leaderboard data retrieval
  
- **Wallet Integration:**
  - `wallet-connection.test.ts`: Test wallet connection and address display
  - `wallet-transaction.test.ts`: Test transaction signing and submission

### 3. End-to-End Tests

End-to-end tests simulate real user interactions to ensure the application works as expected.

#### Planned E2E Tests:

- **User Journeys:**
  - `login-play-game.test.ts`: Test the flow from login to playing a game
  - `place-bet-game.test.ts`: Test placing a bet and playing a game
  - `create-account-update-profile.test.ts`: Test user registration and profile updates

- **Game Playthroughs:**
  - `tetris-playthrough.test.ts`: Test playing Tetris with various moves
  - `temple-runner-playthrough.test.ts`: Test Temple Runner gameplay
  - `street-fighter-playthrough.test.ts`: Test Street Fighter character selection and combat

### 4. Smart Contract Tests

Tests for blockchain smart contracts to ensure correct functioning of betting and payment systems.

#### Planned Smart Contract Tests:

- **Contract Deployment:**
  - `deploy-contract.test.ts`: Test contract deployment and initialization
  
- **Betting Functions:**
  - `place-bet.test.ts`: Test placing bets with different amounts
  - `resolve-bet.test.ts`: Test resolving bets with different outcomes
  - `cancel-bet.test.ts`: Test canceling bets in various scenarios
  
- **Token Integration:**
  - `erc20-deposits.test.ts`: Test depositing ERC20 tokens for betting
  - `eth-deposits.test.ts`: Test ETH deposits and withdrawals

- **Security:**
  - `authorization.test.ts`: Test contract access controls
  - `edge-cases.test.ts`: Test contract behavior in extreme cases

### 5. Fuzz Tests

Fuzz testing helps identify unexpected behaviors by providing random or invalid inputs.

#### Planned Fuzz Tests:

- **Input Validation:**
  - `bet-amount-fuzz.test.ts`: Test with various bet amounts including invalid ones
  - `game-input-fuzz.test.ts`: Test game controls with random input sequences
  
- **State Management:**
  - `game-state-fuzz.test.ts`: Test game state with random state changes
  - `match-resolution-fuzz.test.ts`: Test match resolution with various score combinations

- **Network Conditions:**
  - `network-latency-fuzz.test.ts`: Test app behavior under various network conditions

### 6. Penetration Tests

Security tests to identify vulnerabilities in the application.

#### Planned Penetration Tests:

- **Authentication:**
  - `auth-bypass.test.ts`: Test attempts to bypass authentication
  - `session-hijacking.test.ts`: Test session security
  
- **API Security:**
  - `api-injection.test.ts`: Test API endpoints for injection vulnerabilities
  - `rate-limiting.test.ts`: Test rate limiting protections
  
- **Smart Contract Security:**
  - `contract-reentrancy.test.ts`: Test for reentrancy vulnerabilities
  - `contract-overflow.test.ts`: Test for integer overflow/underflow

## Test Implementation Guidelines

### Writing Effective Unit Tests

1. **Arrange-Act-Assert Pattern**:
   ```typescript
   // Arrange - Set up test data and conditions
   const props = { variant: "primary", size: "md" };
   
   // Act - Perform the action to be tested
   const { getByRole } = render(<Button {...props}>Click Me</Button>);
   
   // Assert - Check that the expected results occurred
   expect(getByRole("button")).toBeInTheDocument();
   ```

2. **Isolation**: Each test should run independently of others

3. **Descriptive Test Names**: Use naming that describes the expected behavior

### Mocking Dependencies

Use Jest's mocking capabilities to isolate the code being tested:

```typescript
// Mock a module
jest.mock("@/lib/web3", () => ({
  connectWallet: jest.fn().mockResolvedValue("0x123"),
}));

// Mock a function
const mockFunction = jest.fn().mockReturnValue(true);
```

### Testing Asynchronous Code

```typescript
test("fetches user data", async () => {
  // Arrange
  const userId = 123;
  
  // Act
  const result = await fetchUserData(userId);
  
  // Assert
  expect(result).toHaveProperty("name");
});
```

## Running Tests

```bash
# Run all tests
npm run test

# Run specific test file
npm run test -- client/src/__tests__/components/button.test.tsx

# Run tests with coverage report
npm run test:coverage

# Run tests in watch mode (automatically rerun when files change)
npm run test:watch
```

## Continuous Integration

Tests are automatically run in the CI pipeline on:
- Pull requests to main branch
- Direct pushes to main branch

## Test Coverage Goals

The project aims for:
- **Lines**: 80% coverage
- **Functions**: 85% coverage
- **Branches**: 75% coverage
- **Statements**: 80% coverage

## Troubleshooting Common Testing Issues

1. **Tests Timing Out**: Increase timeout or fix asynchronous test handling
2. **DOM Testing Issues**: Ensure proper cleanup between tests
3. **Mock Function Not Called**: Verify component is using the correct import path
