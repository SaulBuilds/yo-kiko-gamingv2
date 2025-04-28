-- Create test users with different device fingerprints for the same ICP identity
-- These simulates multiple devices with the same Internet Identity

-- First device
INSERT INTO users (wallet_address, wallet_type, device_id, username, score, xp)
VALUES ('bkyz2-fmaaa-aaaaa-qaaaq-cai', 'icp', 'device-fingerprint-1', 'ICP User (Device 1)', 100, 10);

-- Second device with same wallet address but different device ID
INSERT INTO users (wallet_address, wallet_type, device_id, username, score, xp) 
VALUES ('bkyz2-fmaaa-aaaaa-qaaaq-cai', 'icp', 'device-fingerprint-2', 'ICP User (Device 2)', 200, 20);

-- Third device with same wallet address but different device ID
INSERT INTO users (wallet_address, wallet_type, device_id, username, score, xp)
VALUES ('bkyz2-fmaaa-aaaaa-qaaaq-cai', 'icp', 'device-fingerprint-3', 'ICP User (Device 3)', 300, 30);

-- A regular Ethereum wallet user
INSERT INTO users (wallet_address, wallet_type, device_id, username, score, xp)
VALUES ('0x742d35Cc6634C0532925a3b844Bc454e4438f44e', 'eth', 'device-fingerprint-eth', 'ETH User', 400, 40);

-- Create some test game matches
INSERT INTO game_matches (player1_id, player2_id, bet_amount, bet_type, status, game_type)
VALUES (1, 2, '100', 'xp', 'completed', 'tetris');

INSERT INTO game_matches (player1_id, player2_id, bet_amount, bet_type, status, game_type)
VALUES (3, 4, '200', 'xp', 'waiting', 'temple-runner');