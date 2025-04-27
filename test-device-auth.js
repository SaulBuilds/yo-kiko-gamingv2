/**
 * Device-based authentication test script
 * This script simulates authentication attempts with the same wallet address
 * but different device fingerprints to verify our implementation works correctly
 */

import fetch from 'node-fetch';
const BASE_URL = 'http://localhost:5000';

/**
 * Simulate an authentication attempt with a specific wallet and device
 * @param {string} walletAddress - The blockchain wallet address
 * @param {string} walletType - The type of wallet (icp or eth)
 * @param {string} deviceId - The device fingerprint
 * @returns {Promise<Object>} - The user object if authentication succeeds
 */
async function simulateAuth(walletAddress, walletType, deviceId) {
  try {
    console.log(`\nAuthentication attempt for:\nWallet: ${walletAddress}\nDevice: ${deviceId}\n`);
    
    const response = await fetch(`${BASE_URL}/api/user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        walletAddress,
        walletType,
        deviceId
      })
    });
    
    if (!response.ok) {
      throw new Error(`Authentication failed: ${response.statusText}`);
    }
    
    const user = await response.json();
    console.log('Authentication successful!');
    console.log('User details:', JSON.stringify(user, null, 2));
    return user;
  } catch (error) {
    console.error('Error during authentication:', error.message);
    return null;
  }
}

/**
 * Get a list of all existing users
 * @returns {Promise<Array>} - Array of user objects
 */
async function getAllUsers() {
  try {
    const response = await fetch(`${BASE_URL}/api/admin/users`, {
      method: 'GET',
    });
    
    if (!response.ok) {
      console.log('Note: Admin endpoint might not be available - this is expected');
      return [];
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching users:', error.message);
    return [];
  }
}

/**
 * Run the test cases to verify device-specific authentication
 */
async function runTests() {
  console.log('🧪 TESTING DEVICE-SPECIFIC AUTHENTICATION 🧪');
  console.log('===========================================');
  
  // First, try authenticating with devices we already have in our DB
  const existingDevice1 = await simulateAuth('bkyz2-fmaaa-aaaaa-qaaaq-cai', 'icp', 'device-fingerprint-1');
  const existingDevice2 = await simulateAuth('bkyz2-fmaaa-aaaaa-qaaaq-cai', 'icp', 'device-fingerprint-2');
  const existingDevice3 = await simulateAuth('bkyz2-fmaaa-aaaaa-qaaaq-cai', 'icp', 'device-fingerprint-3');
  
  // Now try with a new device for the same wallet
  const newDevice = await simulateAuth('bkyz2-fmaaa-aaaaa-qaaaq-cai', 'icp', 'device-fingerprint-new');
  
  // Test regular ETH wallet (which should have only one account)
  const ethWallet = await simulateAuth('0x742d35Cc6634C0532925a3b844Bc454e4438f44e', 'eth', 'device-fingerprint-eth');
  
  // Try a totally new wallet address and device
  const newWallet = await simulateAuth('0x992d35Cc6634C0532925a3b844Bc454e4438abcd', 'eth', 'new-device-fingerprint');
  
  // Display test summary
  console.log('\n\n📊 TEST SUMMARY 📊');
  console.log('=================');
  console.log('ICP Wallet with multiple devices:');
  console.log(`- Device 1 User ID: ${existingDevice1?.id}`);
  console.log(`- Device 2 User ID: ${existingDevice2?.id}`);
  console.log(`- Device 3 User ID: ${existingDevice3?.id}`);
  console.log(`- New Device User ID: ${newDevice?.id}`);
  console.log('\nETH wallets:');
  console.log(`- Known ETH wallet User ID: ${ethWallet?.id}`);
  console.log(`- New ETH wallet User ID: ${newWallet?.id}`);
  
  console.log('\nVerification:');
  if (existingDevice1?.id !== existingDevice2?.id && 
      existingDevice2?.id !== existingDevice3?.id && 
      existingDevice1?.id !== existingDevice3?.id) {
    console.log('✅ PASS: Different devices for same ICP identity have different user accounts');
  } else {
    console.log('❌ FAIL: Different devices for same ICP identity should have different user accounts');
  }
  
  if (newDevice?.id && newDevice?.id !== existingDevice1?.id) {
    console.log('✅ PASS: New device for existing ICP identity creates new user account');
  } else {
    console.log('❌ FAIL: New device for existing ICP identity should create new user account');
  }
}

// Execute the tests
runTests();