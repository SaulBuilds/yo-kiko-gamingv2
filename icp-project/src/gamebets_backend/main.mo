// GameBetCanister.mo
// This canister manages game bets using ICP's EVM RPC integration
// It demonstrates how to interact with Ethereum from within ICP canisters

import Array "mo:base/Array";
import Blob "mo:base/Blob";
import Debug "mo:base/Debug";
import Error "mo:base/Error";
import Nat "mo:base/Nat";
import Nat64 "mo:base/Nat64";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Result "mo:base/Result";
import Option "mo:base/Option";
import Time "mo:base/Time";
import HashMap "mo:base/HashMap";

// Interface for the management canister
actor class GameBetCanister() = this {
  type EvmAddress = Text;
  type CanisterId = Principal;
  type ECDSAPublicKey = {
    canister_id : ?CanisterId;
    derivation_path : [Blob];
    key_id : Text;
  };
  type SignWithECDSA = {
    message_hash : Blob;
    derivation_path : [Blob];
    key_id : Text;
  };
  type ECDSASignature = {
    signature : Blob;
    public_key : Blob;
  };
  type Transaction = {
    from: EvmAddress;
    to: EvmAddress;
    value: Nat;
    data: Blob;
    nonce: Nat;
    gas_limit: Nat;
    max_priority_fee_per_gas: Nat;
    max_fee_per_gas: Nat;
  };
  type TransactionResponse = {
    tx_hash: Text;
    raw_tx: Text;
  };
  type GameBet = {
    matchId: Nat;
    player1: EvmAddress;
    player2: ?EvmAddress;
    amount: Nat;
    timestamp: Int;
    token_address: Text;
    is_active: Bool;
    is_paid: Bool;
  };

  // Management Canister Interface
  let ic : actor {
    ecdsa_public_key : ECDSAPublicKey -> async {
      public_key : Blob;
      chain_code : Blob;
    };
    sign_with_ecdsa : SignWithECDSA -> async ECDSASignature;
  } = actor("aaaaa-aa");

  // EVM RPC Canister Interface (simplified)
  let evmRpcCanister : actor {
    eth_getTransactionCount : (provider: Text, address: Text, block_tag: Text) -> async Nat;
    eth_estimateGas : (provider: Text, ?Nat, from: Text, to: Text, ?Nat, data: Text) -> async Nat;
    eth_gasPrice : (provider: Text) -> async Nat;
    eth_sendRawTransaction : (provider: Text, ?Nat, tx_hex: Text, cycles: Nat64) -> async (Text);
    eth_getTransactionReceipt : (provider: Text, tx_hash: Text) -> async {
      status: Bool;
      transaction_hash: Text;
      block_number: Nat;
    };
  } = actor("7hfb6-caaaa-aaaar-qadga-cai"); // Mainnet EVM-RPC canister ID

  // Store game bets
  stable var bets : [(Nat, GameBet)] = [];
  let betsStorage = HashMap.fromIter<Nat, GameBet>(bets.vals(), 10, Nat.equal, func(x) = x); 

  // This will use the same key ID as defined in the docs for Ethereum integration
  private let KEY_ID = "dfx_test_key";
  private let DERIVATION_PATH = [Blob.fromArray([])];
  private let ETHEREUM_RPC_URL = "https://mainnet.infura.io/v3/<YOUR_INFURA_KEY>";
  private let EVM_RPC_CYCLES = 10_000_000_000; // 10B cycles for external calls

  // Get the Ethereum address for the canister
  public func getEthereumAddress() : async Text {
    let result = await ic.ecdsa_public_key({
      canister_id = null;
      derivation_path = DERIVATION_PATH;
      key_id = KEY_ID;
    });
    
    let publicKey = result.public_key;
    Debug.print("Public key: " # debug_show(publicKey));
    
    // Convert the public key to an Ethereum address
    // In a real implementation, we would derive the address using Keccak256
    // For demo purposes, we're returning a placeholder address format
    let address = "0xCanisterAddress";
    address
  };

  // Create a new bet using the EVM RPC canister
  public shared(msg) func createBet(
    matchId: Nat, 
    tokenAddress: Text, 
    receiver: Text, 
    amount: Nat
  ) : async Result.Result<Text, Text> {
    try {
      // For demo purposes, we're showing the flow but not executing actual transactions
      Debug.print("Creating bet for match ID: " # Nat.toText(matchId));
      
      // Step 1: Get the canister's Ethereum address
      let sender = await getEthereumAddress();
      
      // Step 2: Get the current nonce for the sender address
      let nonce = await evmRpcCanister.eth_getTransactionCount(
        ETHEREUM_RPC_URL, 
        sender, 
        "latest"
      );
      
      // Step 3: Build the transaction
      let transaction : Transaction = {
        from = sender;
        to = receiver;
        value = amount;
        data = Blob.fromArray([]);
        nonce = nonce;
        gas_limit = 21000; // Basic ETH transfer
        max_priority_fee_per_gas = 2_000_000_000; // 2 Gwei
        max_fee_per_gas = 20_000_000_000; // 20 Gwei
      };
      
      // Step 4: Get message hash to sign
      // In a real implementation, we would compute the hash of the transaction
      let messageHash = Blob.fromArray([0, 1, 2, 3]); // Placeholder
      
      // Step 5: Sign the transaction hash using threshold ECDSA
      let sig = await ic.sign_with_ecdsa({
        message_hash = messageHash;
        derivation_path = DERIVATION_PATH;
        key_id = KEY_ID;
      });
      
      Debug.print("Transaction signed successfully");
      
      // Store the bet in our local storage
      let bet : GameBet = {
        matchId = matchId;
        player1 = sender;
        player2 = null;
        amount = amount;
        timestamp = Time.now();
        token_address = tokenAddress;
        is_active = true;
        is_paid = false;
      };
      
      betsStorage.put(matchId, bet);
      
      // Step 6: In a real implementation, we would call eth_sendRawTransaction
      // For demo purposes, we're returning a success message
      #ok("Transaction submitted for matchId: " # Nat.toText(matchId))
    } catch (e) {
      #err("Error creating bet: " # Error.message(e))
    }
  };

  // Accept a bet for a specific match
  public shared(msg) func acceptBet(matchId: Nat) : async Result.Result<Text, Text> {
    try {
      switch (betsStorage.get(matchId)) {
        case (null) {
          return #err("Bet not found for match ID: " # Nat.toText(matchId));
        };
        case (?existingBet) {
          if (not existingBet.is_active) {
            return #err("Bet is not active");
          };
          
          if (Option.isSome(existingBet.player2)) {
            return #err("Bet already accepted");
          };
          
          // Get the canister's Ethereum address
          let player2Address = await getEthereumAddress();
          
          // Update the bet with player2
          let updatedBet = {
            matchId = existingBet.matchId;
            player1 = existingBet.player1;
            player2 = ?player2Address;
            amount = existingBet.amount;
            timestamp = existingBet.timestamp;
            token_address = existingBet.token_address;
            is_active = existingBet.is_active;
            is_paid = existingBet.is_paid;
          };
          
          betsStorage.put(matchId, updatedBet);
          
          // In a real implementation, we would also send a transaction to the Ethereum contract
          // to accept the bet, similar to the createBet function
          #ok("Bet accepted for match ID: " # Nat.toText(matchId))
        };
      }
    } catch (e) {
      #err("Error accepting bet: " # Error.message(e))
    }
  };

  // Pay out the bet to the winner
  public shared(msg) func payoutBet(matchId: Nat, winner: Text) : async Result.Result<Text, Text> {
    try {
      switch (betsStorage.get(matchId)) {
        case (null) {
          return #err("Bet not found for match ID: " # Nat.toText(matchId));
        };
        case (?existingBet) {
          if (not existingBet.is_active) {
            return #err("Bet is not active");
          };
          
          if (existingBet.is_paid) {
            return #err("Bet already paid");
          };
          
          if (existingBet.player1 != winner and Option.get(existingBet.player2, "") != winner) {
            return #err("Invalid winner address");
          };
          
          // Update the bet to mark it as paid
          let updatedBet = {
            matchId = existingBet.matchId;
            player1 = existingBet.player1;
            player2 = existingBet.player2;
            amount = existingBet.amount;
            timestamp = existingBet.timestamp;
            token_address = existingBet.token_address;
            is_active = false;
            is_paid = true;
          };
          
          betsStorage.put(matchId, updatedBet);
          
          // In a real implementation, we would call the payout function on the Ethereum contract
          // This would follow the same pattern as createBet: build transaction, sign, and send
          #ok("Bet paid out to " # winner # " for match ID: " # Nat.toText(matchId))
        };
      }
    } catch (e) {
      #err("Error paying out bet: " # Error.message(e))
    }
  };

  // Get bet details for a specific match
  public query func getBet(matchId: Nat) : async ?GameBet {
    betsStorage.get(matchId)
  };

  // System upgrade hook
  system func preupgrade() {
    bets := Iter.toArray(betsStorage.entries());
  };

  system func postupgrade() {
    bets := [];
  };
}