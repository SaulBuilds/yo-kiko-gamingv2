/**
 * @file device-fingerprint.ts
 * @description Utility functions for generating device fingerprints to support device-specific user accounts
 * 
 * This module provides functionality to generate and manage unique device identifiers for enhancing
 * security and enabling device-specific user accounts.
 */

// Storage key for the device ID in localStorage
const DEVICE_ID_STORAGE_KEY = 'yokiko_device_id';

/**
 * Generates a unique fingerprint based on device and browser characteristics
 * This helps create device-specific accounts for users, particularly for Internet Identity logins
 * where the same principal can be used across multiple devices
 * 
 * @returns {string} A unique identifier for the current device
 */
export function generateDeviceFingerprint(): string {
  try {
    // Collect various properties from the browser environment
    const userAgent = navigator.userAgent || '';
    const screenWidth = window.screen?.width || 0;
    const screenHeight = window.screen?.height || 0;
    const platform = navigator.platform || '';
    const language = navigator.language || '';
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    const colorDepth = window.screen?.colorDepth || 0;
    const pixelRatio = window.devicePixelRatio || 1;
    const hardwareConcurrency = navigator.hardwareConcurrency || 1;
    
    // Add some randomness to make device spoofing more difficult
    const randomSalt = Math.random().toString(36).substring(2, 15);
    
    // Create a unique string combining various browser/device characteristics
    const deviceData = [
      userAgent,
      `${screenWidth}x${screenHeight}`,
      platform,
      language,
      timezone,
      colorDepth,
      pixelRatio,
      hardwareConcurrency,
      randomSalt,
      // Add timestamp to handle case where multiple users share a device
      new Date().toISOString().split('T')[0] // Just the date part
    ].join('-');
    
    // Convert to a consistent hash string
    return btoa(deviceData).substring(0, 32);
  } catch (error) {
    console.error('Error generating device fingerprint:', error);
    // Fallback with some randomness to at least have something unique
    return `fallback-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }
}

/**
 * Gets the device fingerprint from localStorage or generates a new one
 * 
 * @returns {string} The device fingerprint
 */
export function getOrCreateDeviceFingerprint(): string {
  try {
    // Check if we have an existing fingerprint in localStorage
    let deviceId = localStorage.getItem(DEVICE_ID_STORAGE_KEY);
    
    // If no existing fingerprint, generate and store a new one
    if (!deviceId) {
      deviceId = generateDeviceFingerprint();
      localStorage.setItem(DEVICE_ID_STORAGE_KEY, deviceId);
    }
    
    return deviceId;
  } catch (error) {
    console.error('Error accessing localStorage for device fingerprint:', error);
    // Fallback if localStorage is not available (private browsing, etc.)
    return generateDeviceFingerprint();
  }
}