/**
 * @file device-fingerprint.ts
 * @description Utility functions for generating device fingerprints to support device-specific user accounts
 */

/**
 * Generates a unique fingerprint based on device and browser characteristics
 * This helps create device-specific accounts for users, particularly for Internet Identity logins
 * where the same principal can be used across multiple devices
 * 
 * @returns {string} A unique identifier for the current device
 */
export function generateDeviceFingerprint(): string {
  // Collect various properties from the browser environment
  const userAgent = navigator.userAgent;
  const screenWidth = window.screen.width;
  const screenHeight = window.screen.height;
  const platform = navigator.platform;
  const language = navigator.language;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const colorDepth = window.screen.colorDepth;
  
  // Create a unique string combining various browser/device characteristics
  const deviceData = `${userAgent}-${screenWidth}x${screenHeight}-${platform}-${language}-${timezone}-${colorDepth}`;
  
  // Convert to a consistent hash string
  return btoa(deviceData).substring(0, 32);
}

/**
 * Gets the device fingerprint from localStorage or generates a new one
 * 
 * @returns {string} The device fingerprint
 */
export function getOrCreateDeviceFingerprint(): string {
  // Check if we have an existing fingerprint in localStorage
  let deviceId = localStorage.getItem('device_id');
  
  // If no existing fingerprint, generate and store a new one
  if (!deviceId) {
    deviceId = generateDeviceFingerprint();
    localStorage.setItem('device_id', deviceId);
  }
  
  return deviceId;
}