# 4-Minute Yokiko Gaming Platform ICP Integration Walkthrough

## 1. User Login Flow (60 seconds)

Let's start by opening our authentication flow in `client/src/hooks/use-auth.tsx`:

```typescript
// Line ~32: AuthContext setup
export const AuthContext = createContext<AuthContextType | null>(null);

// Line ~45: AuthProvider component
export function AuthProvider({ children }: { children: ReactNode }) {
  // State management for authentication
  const [user, setUser] = useState<SelectUser | null>(null);
  // ...
```

This provides the authentication context throughout our application.

Now let's look at the ICP-specific login component in `client/src/components/connect-icp.tsx`:

```typescript
// Line ~25: Component for ICP authentication
export function ConnectICP() {
  const { connect, isConnecting } = useAuth();
  
  // When a user clicks the Internet Identity button
  const handleIcpLogin = async () => {
    try {
      // Attempt to connect with Internet Identity
      await connect();
      // ...
    } catch (error) {
      // Error handling
    }
  };
  
  return (
    // Button UI for Internet Identity login
  );
}
```

The key to device fingerprinting is in `client/src/lib/device-fingerprint.ts`:

```typescript
// Line ~19: Generate a unique device identifier
export function generateDeviceFingerprint(): string {
  try {
    // Collect browser and device characteristics
    const userAgent = navigator.userAgent || '';
    const screenWidth = window.screen?.width || 0;
    // ...and more properties

    // Create a unique string from device data
    const deviceData = [ /* device properties */ ].join('-');
    
    // Return an encoded fingerprint
    return btoa(deviceData).substring(0, 32);
  } catch (error) {
    // Fallback with randomness if generation fails
  }
}
```

## 2. Starting a Tetris Game (60 seconds)

After login, the user navigates to Tetris through `client/src/pages/games/tetris.tsx`:

```typescript
// Page component that loads the Tetris game
export default function TetrisPage() {
  const { user } = useAuth();
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    level: 1,
    // Initial game state...
  });
  
  // WebSocket for real-time game state updates
  useEffect(() => {
    const socket = new WebSocket(`${wsProtocol}//${window.location.host}/game-ws`);
    
    socket.onmessage = (event) => {
      // Update game state in real-time
    };
    
    // Cleanup on unmount
    return () => socket.close();
  }, []);
  
  // Game logic and rendering
}
```

The WebSocket server is defined in `server/routes.ts`:

```typescript
// Line ~55: WebSocket server initialization
export async function registerRoutes(app: Express): Promise<Server> {
  // HTTP server setup
  
  // Line ~240: Game WebSocket setup
  const wss = new WebSocketServer({ server: httpServer, path: '/game-ws' });
  
  wss.on('connection', (ws) => {
    // Handle game state updates
    ws.on('message', (message) => {
      // Process game events
    });
  });
}
```

## 3. Earning XP and Creating a Bet (60 seconds)

When the game ends, the user earns XP through `server/storage.ts`:

```typescript
// Line ~245: XP update function
async updateUserXP(userId: number, xp: number, updateScore: boolean): Promise<void> {
  await db.transaction(async (tx) => {
    // Get current user data
    const [user] = await tx.select().from(users).where(eq(users.id, userId));
    
    if (user) {
      // Calculate new XP
      const newXP = user.xp + xp;
      
      // Update the user record
      await tx.update(users)
        .set({ 
          xp: newXP,
          // Update score if needed
          score: updateScore ? user.score + Math.floor(xp / 10) : user.score
        })
        .where(eq(users.id, userId));
    }
  });
}
```

Now, the user wants to create a bet using ICP. This is handled in `client/src/lib/icp-eth-bridge.ts`:

```typescript
// Line ~135: Main betting function
export async function createBetWithICP(
  matchId: number,
  amount: number,
  tokenAddress: string,
  receiverAddress: string,
): Promise<string> {
  try {
    // Initialize GameBet canister
    const canister = await initGameBetCanister();
    
    // Call canister method to create bet
    const result = await canister.createBet(
      BigInt(matchId),
      tokenAddress,
      receiverAddress,
      BigInt(amount),
    );

    // Handle potential errors
    if ('err' in result) {
      throw new Error(`Failed to create bet: ${result.err}`);
    }

    // Return transaction hash
    return result.ok;
  } catch (error) {
    console.error('Error creating bet with ICP:', error);
    throw error;
  }
}
```

The canister itself is defined in `icp-project/src/GameBetCanister.mo`:

```motoko
// Simplified version of the Motoko canister code
public shared func createBet(matchId: Nat, tokenAddress: Text, receiver: Text, amount: Nat) : async Result<Text, Text> {
  // Validation
  if (amount < minBetAmount) {
    return #err("Bet amount too small");
  };
  
  // Create signature with threshold ECDSA
  let signature = await ThresholdEcdsaAPI.sign_with_ecdsa({
    message_hash = messageHash,
    derivation_path = derivationPath,
    key_id = keyId
  });
  
  // Create the Ethereum transaction
  let transaction = buildEthereumTransaction(tokenAddress, receiver, amount, signature);
  
  // Submit to Ethereum via EVM RPC canister
  let txHash = await EvmRpcAPI.eth_sendRawTransaction(transaction);
  
  // Store bet data and return txHash
  bets.put(matchId, {
    matchId = matchId;
    player1 = caller;
    amount = amount;
    // Other fields...
  });
  
  return #ok(txHash);
};
```

## 4. Real-time Updates and Conclusion (60 seconds)

For real-time updates of bet status, we use WebSockets:

```typescript
// In client/src/components/game/icp-bet-widget.tsx
useEffect(() => {
  // Connect to bet-specific WebSocket
  const socket = new WebSocket(`${wsProtocol}//${window.location.host}/icp-bets-ws`);
  
  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    
    // Update bet status in UI
    if (data.matchId === matchId) {
      setBetStatus(data.status);
      
      if (data.status === 'paid') {
        // Handle successful payout
      }
    }
  };
  
  return () => socket.close();
}, [matchId]);
```

Back in `server/routes.ts`, we see the WebSocket handler:

```typescript
// Line ~275: ICP Bets WebSocket
const icpBetsWss = new WebSocketServer({ server: httpServer, path: '/icp-bets-ws' });

icpBetsWss.on('connection', (ws) => {
  // Set up subscription to bet events
  
  // Periodically check for bet status updates via canister
  const checkInterval = setInterval(async () => {
    for (const matchId of activeMatches) {
      try {
        const betDetails = await getBetWithICP(matchId);
        
        if (betDetails) {
          // Send updates to all connected clients
          const message = JSON.stringify({
            matchId: matchId,
            status: betDetails.is_paid ? 'paid' : (betDetails.is_active ? 'active' : 'pending'),
            // Other bet details...
          });
          
          ws.send(message);
        }
      } catch (error) {
        console.error(`Error checking bet status for match ${matchId}:`, error);
      }
    }
  }, 5000); // Check every 5 seconds
  
  // Clean up interval on disconnect
  ws.on('close', () => clearInterval(checkInterval));
});
```

### Conclusion

In this walkthrough, we've seen how a player:

1. Logs in using Internet Identity with device fingerprinting
2. Plays Tetris with real-time updates via WebSockets
3. Earns XP that persists in our database
4. Creates a bet using ICP's threshold ECDSA
5. Receives real-time updates on bet status

This demonstrates the full power of our ICP integration, creating a seamless gaming experience that bridges multiple blockchains.

---

*This code walkthrough follows a user journey from login through gameplay to betting, highlighting the Internet Computer Protocol integration throughout.*