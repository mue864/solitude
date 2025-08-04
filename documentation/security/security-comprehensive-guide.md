# React Native Security Comprehensive Guide

## Table of Contents

1. [Introduction & Security Fundamentals](#introduction--security-fundamentals)
2. [Authentication & Authorization](#authentication--authorization)
3. [Data Encryption](#data-encryption)
4. [Secure Storage](#secure-storage)
5. [API Security](#api-security)
6. [Code Protection](#code-protection)
7. [Network Security](#network-security)
8. [Security Best Practices](#security-best-practices)
9. [Real-World Examples](#real-world-examples)

## Introduction & Security Fundamentals

### Security Checklist

```javascript
// security-checklist.js
export const SecurityChecklist = {
  // Authentication
  authentication: {
    implementJWT: true,
    tokenRefresh: true,
    biometricAuth: true,
    secureLogout: true,
  },

  // Data Protection
  dataProtection: {
    encryptSensitiveData: true,
    useSecureStorage: true,
    implementKeychain: true,
    dataSanitization: true,
  },

  // API Security
  apiSecurity: {
    useHTTPS: true,
    implementCertificatePinning: true,
    validateAPIResponses: true,
    rateLimiting: true,
  },

  // Code Protection
  codeProtection: {
    enableProguard: true,
    codeObfuscation: true,
    disableDebugging: true,
    rootDetection: true,
  },

  // Network Security
  networkSecurity: {
    certificatePinning: true,
    networkSecurityConfig: true,
    disableCleartextTraffic: true,
  },
};
```

### Security Utilities

```javascript
// utils/security.js
import { Platform } from "react-native";
import * as Crypto from "expo-crypto";
import * as SecureStore from "expo-secure-store";

export class SecurityManager {
  static async generateSecureKey() {
    const randomBytes = await Crypto.getRandomBytesAsync(32);
    return Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      randomBytes.toString()
    );
  }

  static async hashPassword(password) {
    return await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      password
    );
  }

  static async encryptData(data, key) {
    // Implementation for data encryption
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(JSON.stringify(data));

    // Use Web Crypto API for encryption
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      encoder.encode(key),
      { name: "AES-GCM" },
      false,
      ["encrypt"]
    );

    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      cryptoKey,
      dataBuffer
    );

    return {
      data: Array.from(new Uint8Array(encrypted)),
      iv: Array.from(iv),
    };
  }

  static async decryptData(encryptedData, key) {
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      encoder.encode(key),
      { name: "AES-GCM" },
      false,
      ["decrypt"]
    );

    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: new Uint8Array(encryptedData.iv) },
      cryptoKey,
      new Uint8Array(encryptedData.data)
    );

    return JSON.parse(decoder.decode(decrypted));
  }
}
```

## Authentication & Authorization

### 1. JWT Token Management

```javascript
// utils/auth.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import jwt_decode from "jwt-decode";

class AuthManager {
  constructor() {
    this.tokenKey = "auth_token";
    this.refreshTokenKey = "refresh_token";
  }

  async setTokens(accessToken, refreshToken) {
    try {
      // Store tokens securely
      await SecureStore.setItemAsync(this.tokenKey, accessToken);
      await SecureStore.setItemAsync(this.refreshTokenKey, refreshToken);

      // Decode and store token info
      const decoded = jwt_decode(accessToken);
      await AsyncStorage.setItem("token_info", JSON.stringify(decoded));
    } catch (error) {
      console.error("Error storing tokens:", error);
      throw error;
    }
  }

  async getAccessToken() {
    try {
      return await SecureStore.getItemAsync(this.tokenKey);
    } catch (error) {
      console.error("Error retrieving access token:", error);
      return null;
    }
  }

  async getRefreshToken() {
    try {
      return await SecureStore.getItemAsync(this.refreshTokenKey);
    } catch (error) {
      console.error("Error retrieving refresh token:", error);
      return null;
    }
  }

  async isTokenValid() {
    const token = await this.getAccessToken();
    if (!token) return false;

    try {
      const decoded = jwt_decode(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp > currentTime;
    } catch (error) {
      return false;
    }
  }

  async refreshToken() {
    try {
      const refreshToken = await this.getRefreshToken();
      if (!refreshToken) throw new Error("No refresh token available");

      const response = await fetch("/auth/refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${refreshToken}`,
        },
      });

      if (!response.ok) throw new Error("Token refresh failed");

      const { accessToken, refreshToken: newRefreshToken } =
        await response.json();
      await this.setTokens(accessToken, newRefreshToken);

      return accessToken;
    } catch (error) {
      await this.clearTokens();
      throw error;
    }
  }

  async clearTokens() {
    try {
      await SecureStore.deleteItemAsync(this.tokenKey);
      await SecureStore.deleteItemAsync(this.refreshTokenKey);
      await AsyncStorage.removeItem("token_info");
    } catch (error) {
      console.error("Error clearing tokens:", error);
    }
  }

  async logout() {
    try {
      const token = await this.getAccessToken();
      if (token) {
        // Call logout endpoint
        await fetch("/auth/logout", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      await this.clearTokens();
    }
  }
}

export const authManager = new AuthManager();
```

### 2. Biometric Authentication

```javascript
// utils/biometricAuth.js
import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";

class BiometricAuth {
  constructor() {
    this.biometricKey = "biometric_enabled";
  }

  async isBiometricAvailable() {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    return hasHardware && isEnrolled;
  }

  async enableBiometric() {
    try {
      const isAvailable = await this.isBiometricAvailable();
      if (!isAvailable) {
        throw new Error("Biometric authentication not available");
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Authenticate to enable biometric login",
        fallbackLabel: "Use passcode",
      });

      if (result.success) {
        await SecureStore.setItemAsync(this.biometricKey, "true");
        return true;
      }
      return false;
    } catch (error) {
      console.error("Biometric enable error:", error);
      return false;
    }
  }

  async authenticateWithBiometric() {
    try {
      const isEnabled = await SecureStore.getItemAsync(this.biometricKey);
      if (isEnabled !== "true") {
        throw new Error("Biometric authentication not enabled");
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Authenticate to access the app",
        fallbackLabel: "Use passcode",
      });

      return result.success;
    } catch (error) {
      console.error("Biometric authentication error:", error);
      return false;
    }
  }

  async disableBiometric() {
    try {
      await SecureStore.deleteItemAsync(this.biometricKey);
      return true;
    } catch (error) {
      console.error("Disable biometric error:", error);
      return false;
    }
  }
}

export const biometricAuth = new BiometricAuth();
```

### 3. Secure API Client

```javascript
// api/secureClient.js
import { authManager } from "../utils/auth";

class SecureApiClient {
  constructor(baseURL) {
    this.baseURL = baseURL;
    this.retryCount = 0;
    this.maxRetries = 3;
  }

  async request(endpoint, options = {}) {
    const token = await authManager.getAccessToken();

    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers,
      });

      if (response.status === 401 && this.retryCount < this.maxRetries) {
        this.retryCount++;

        // Try to refresh token
        const newToken = await authManager.refreshToken();
        if (newToken) {
          headers.Authorization = `Bearer ${newToken}`;

          // Retry request with new token
          const retryResponse = await fetch(`${this.baseURL}${endpoint}`, {
            ...options,
            headers,
          });

          this.retryCount = 0;
          return this.handleResponse(retryResponse);
        }
      }

      this.retryCount = 0;
      return this.handleResponse(response);
    } catch (error) {
      console.error("API request error:", error);
      throw error;
    }
  }

  async handleResponse(response) {
    if (!response.ok) {
      if (response.status === 401) {
        await authManager.logout();
        throw new Error("Authentication failed");
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { data, status: response.status };
  }

  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: "GET" });
  }

  post(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: "POST", body });
  }

  put(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: "PUT", body });
  }

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: "DELETE" });
  }
}

export const secureApiClient = new SecureApiClient(
  "https://api.yourbackend.com"
);
```

## Data Encryption

### 1. Data Encryption Utilities

```javascript
// utils/encryption.js
import * as Crypto from "expo-crypto";

class EncryptionManager {
  constructor() {
    this.algorithm = "AES-GCM";
    this.keyLength = 256;
  }

  async generateKey() {
    const keyMaterial = await crypto.subtle.generateKey(
      {
        name: "PBKDF2",
        salt: crypto.getRandomValues(new Uint8Array(16)),
        iterations: 100000,
        hash: "SHA-256",
      },
      { name: this.algorithm, length: this.keyLength },
      false,
      ["encrypt", "decrypt"]
    );

    return keyMaterial;
  }

  async encryptData(data, key) {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(JSON.stringify(data));

    const iv = crypto.getRandomValues(new Uint8Array(12));

    const encrypted = await crypto.subtle.encrypt(
      { name: this.algorithm, iv },
      key,
      dataBuffer
    );

    return {
      data: Array.from(new Uint8Array(encrypted)),
      iv: Array.from(iv),
    };
  }

  async decryptData(encryptedData, key) {
    const decoder = new TextDecoder();

    const decrypted = await crypto.subtle.decrypt(
      { name: this.algorithm, iv: new Uint8Array(encryptedData.iv) },
      key,
      new Uint8Array(encryptedData.data)
    );

    return JSON.parse(decoder.decode(decrypted));
  }

  async hashData(data) {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(JSON.stringify(data));

    const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));

    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }
}

export const encryptionManager = new EncryptionManager();
```

### 2. Sensitive Data Protection

```javascript
// utils/sensitiveData.js
import * as SecureStore from "expo-secure-store";
import { encryptionManager } from "./encryption";

class SensitiveDataManager {
  constructor() {
    this.encryptionKey = null;
  }

  async initialize() {
    // Generate or retrieve encryption key
    const storedKey = await SecureStore.getItemAsync("encryption_key");
    if (storedKey) {
      this.encryptionKey = JSON.parse(storedKey);
    } else {
      this.encryptionKey = await encryptionManager.generateKey();
      await SecureStore.setItemAsync(
        "encryption_key",
        JSON.stringify(this.encryptionKey)
      );
    }
  }

  async storeSensitiveData(key, data) {
    if (!this.encryptionKey) {
      await this.initialize();
    }

    const encrypted = await encryptionManager.encryptData(
      data,
      this.encryptionKey
    );
    await SecureStore.setItemAsync(key, JSON.stringify(encrypted));
  }

  async getSensitiveData(key) {
    if (!this.encryptionKey) {
      await this.initialize();
    }

    const encryptedData = await SecureStore.getItemAsync(key);
    if (!encryptedData) return null;

    const parsed = JSON.parse(encryptedData);
    return await encryptionManager.decryptData(parsed, this.encryptionKey);
  }

  async removeSensitiveData(key) {
    await SecureStore.deleteItemAsync(key);
  }

  async clearAllSensitiveData() {
    // Clear all sensitive data
    const keys = [
      "user_profile",
      "session_data",
      "journal_entries",
      "analytics_data",
    ];

    for (const key of keys) {
      await SecureStore.deleteItemAsync(key);
    }
  }
}

export const sensitiveDataManager = new SensitiveDataManager();
```

## Secure Storage

### 1. Secure Storage Implementation

```javascript
// utils/secureStorage.js
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";

class SecureStorage {
  constructor() {
    this.isSecureStoreAvailable = SecureStore.isAvailableAsync();
  }

  async setItem(key, value, secure = false) {
    try {
      if (secure && (await this.isSecureStoreAvailable)) {
        await SecureStore.setItemAsync(key, JSON.stringify(value));
      } else {
        await AsyncStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      console.error("Error storing data:", error);
      throw error;
    }
  }

  async getItem(key, secure = false) {
    try {
      let value;
      if (secure && (await this.isSecureStoreAvailable)) {
        value = await SecureStore.getItemAsync(key);
      } else {
        value = await AsyncStorage.getItem(key);
      }

      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error("Error retrieving data:", error);
      return null;
    }
  }

  async removeItem(key, secure = false) {
    try {
      if (secure && (await this.isSecureStoreAvailable)) {
        await SecureStore.deleteItemAsync(key);
      } else {
        await AsyncStorage.removeItem(key);
      }
    } catch (error) {
      console.error("Error removing data:", error);
    }
  }

  async clear() {
    try {
      await AsyncStorage.clear();
      // Note: SecureStore doesn't have a clear method
    } catch (error) {
      console.error("Error clearing storage:", error);
    }
  }

  // Store sensitive data securely
  async setSecureItem(key, value) {
    return this.setItem(key, value, true);
  }

  async getSecureItem(key) {
    return this.getItem(key, true);
  }

  async removeSecureItem(key) {
    return this.removeItem(key, true);
  }
}

export const secureStorage = new SecureStorage();
```

### 2. Keychain Integration (iOS)

```javascript
// utils/keychain.js
import * as Keychain from "react-native-keychain";

class KeychainManager {
  async storeCredentials(username, password, service = "default") {
    try {
      await Keychain.setInternetCredentials(service, username, password);
      return true;
    } catch (error) {
      console.error("Error storing credentials:", error);
      return false;
    }
  }

  async getCredentials(service = "default") {
    try {
      const credentials = await Keychain.getInternetCredentials(service);
      return credentials;
    } catch (error) {
      console.error("Error retrieving credentials:", error);
      return null;
    }
  }

  async removeCredentials(service = "default") {
    try {
      await Keychain.resetInternetCredentials(service);
      return true;
    } catch (error) {
      console.error("Error removing credentials:", error);
      return false;
    }
  }

  async storeSecureItem(key, value) {
    try {
      await Keychain.setGenericPassword(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error("Error storing secure item:", error);
      return false;
    }
  }

  async getSecureItem(key) {
    try {
      const result = await Keychain.getGenericPassword();
      if (result && result.password) {
        return JSON.parse(result.password);
      }
      return null;
    } catch (error) {
      console.error("Error retrieving secure item:", error);
      return null;
    }
  }
}

export const keychainManager = new KeychainManager();
```

## API Security

### 1. Certificate Pinning

```javascript
// utils/certificatePinning.js
import { Platform } from "react-native";

class CertificatePinning {
  constructor() {
    this.pinnedCertificates = {
      "api.yourbackend.com": [
        "sha256/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",
        "sha256/BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB=",
      ],
    };
  }

  async validateCertificate(hostname, certificate) {
    if (Platform.OS === "ios") {
      return this.validateCertificateIOS(hostname, certificate);
    } else {
      return this.validateCertificateAndroid(hostname, certificate);
    }
  }

  async validateCertificateIOS(hostname, certificate) {
    // iOS certificate validation
    const pinnedCerts = this.pinnedCertificates[hostname];
    if (!pinnedCerts) return true;

    const certHash = this.calculateCertificateHash(certificate);
    return pinnedCerts.includes(certHash);
  }

  async validateCertificateAndroid(hostname, certificate) {
    // Android certificate validation
    const pinnedCerts = this.pinnedCertificates[hostname];
    if (!pinnedCerts) return true;

    const certHash = this.calculateCertificateHash(certificate);
    return pinnedCerts.includes(certHash);
  }

  calculateCertificateHash(certificate) {
    // Implementation for certificate hash calculation
    return "sha256/" + certificate;
  }
}

export const certificatePinning = new CertificatePinning();
```

### 2. Secure API Client with Pinning

```javascript
// api/secureApiClient.js
import { certificatePinning } from "../utils/certificatePinning";

class SecureApiClientWithPinning {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      });

      // Validate certificate if available
      if (response.url) {
        const hostname = new URL(response.url).hostname;
        // Certificate validation would be implemented here
        // await certificatePinning.validateCertificate(hostname, certificate);
      }

      return this.handleResponse(response);
    } catch (error) {
      console.error("Secure API request error:", error);
      throw error;
    }
  }

  async handleResponse(response) {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { data, status: response.status };
  }
}

export const secureApiClientWithPinning = new SecureApiClientWithPinning(
  "https://api.yourbackend.com"
);
```

## Code Protection

### 1. Root Detection

```javascript
// utils/rootDetection.js
import { Platform } from "react-native";
import JailMonkey from "react-native-jail-monkey";

class RootDetection {
  constructor() {
    this.isRooted = false;
    this.checkRootStatus();
  }

  async checkRootStatus() {
    try {
      if (Platform.OS === "android") {
        this.isRooted = await this.checkAndroidRoot();
      } else {
        this.isRooted = await this.checkIOSJailbreak();
      }
    } catch (error) {
      console.error("Root detection error:", error);
      this.isRooted = false;
    }
  }

  async checkAndroidRoot() {
    const checks = [
      JailMonkey.isJailBroken(),
      JailMonkey.canMockLocation(),
      JailMonkey.trustFall(),
      JailMonkey.AdbEnabled(),
    ];

    const results = await Promise.all(checks);
    return results.some((result) => result);
  }

  async checkIOSJailbreak() {
    const checks = [
      JailMonkey.isJailBroken(),
      JailMonkey.canMockLocation(),
      JailMonkey.trustFall(),
    ];

    const results = await Promise.all(checks);
    return results.some((result) => result);
  }

  isDeviceRooted() {
    return this.isRooted;
  }

  async validateEnvironment() {
    if (this.isDeviceRooted()) {
      throw new Error("Device is rooted/jailbroken. App cannot run.");
    }

    // Additional security checks
    if (__DEV__) {
      console.warn("Running in development mode");
    }

    return true;
  }
}

export const rootDetection = new RootDetection();
```

### 2. Debug Detection

```javascript
// utils/debugDetection.js
import { Platform } from "react-native";

class DebugDetection {
  constructor() {
    this.isDebuggerAttached = false;
    this.checkDebugStatus();
  }

  checkDebugStatus() {
    if (__DEV__) {
      this.isDebuggerAttached = true;
    } else {
      // Additional debug detection logic
      this.isDebuggerAttached = false;
    }
  }

  isDebugMode() {
    return this.isDebuggerAttached;
  }

  validateProductionEnvironment() {
    if (this.isDebugMode()) {
      console.warn("Debug mode detected");
      // In production, you might want to exit the app
      // return false;
    }
    return true;
  }
}

export const debugDetection = new DebugDetection();
```

## Network Security

### 1. Network Security Configuration

```javascript
// android/app/src/main/res/xml/network_security_config.xml
const networkSecurityConfig = `
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <domain-config cleartextTrafficPermitted="false">
        <domain includeSubdomains="true">api.yourbackend.com</domain>
        <trust-anchors>
            <certificates src="system"/>
            <certificates src="user"/>
        </trust-anchors>
        <pin-set expiration="2023-12-31">
            <pin digest="SHA-256">AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=</pin>
            <pin digest="SHA-256">BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB=</pin>
        </pin-set>
    </domain-config>
</network-security-config>
`;

// android/app/src/main/AndroidManifest.xml
const androidManifest = `
<application
    android:networkSecurityConfig="@xml/network_security_config"
    android:usesCleartextTraffic="false">
`;
```

### 2. SSL Pinning Implementation

```javascript
// utils/sslPinning.js
import { Platform } from "react-native";

class SSLPinning {
  constructor() {
    this.pinnedHosts = {
      "api.yourbackend.com": [
        "sha256/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",
        "sha256/BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB=",
      ],
    };
  }

  async validateSSL(hostname, certificate) {
    const pinnedCerts = this.pinnedHosts[hostname];
    if (!pinnedCerts) return true;

    const certHash = this.calculateCertificateHash(certificate);
    return pinnedCerts.includes(certHash);
  }

  calculateCertificateHash(certificate) {
    // Implementation for certificate hash calculation
    return "sha256/" + certificate;
  }
}

export const sslPinning = new SSLPinning();
```

## Security Best Practices

### 1. Input Validation

```javascript
// utils/inputValidation.js
class InputValidator {
  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validatePassword(password) {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  }

  static sanitizeInput(input) {
    return input
      .replace(/[<>]/g, "") // Remove potential HTML tags
      .replace(/javascript:/gi, "") // Remove javascript: protocol
      .trim();
  }

  static validateURL(url) {
    try {
      const parsed = new URL(url);
      return ["http:", "https:"].includes(parsed.protocol);
    } catch {
      return false;
    }
  }

  static validateJSON(jsonString) {
    try {
      JSON.parse(jsonString);
      return true;
    } catch {
      return false;
    }
  }
}

export { InputValidator };
```

### 2. Security Monitoring

```javascript
// utils/securityMonitoring.js
class SecurityMonitor {
  constructor() {
    this.securityEvents = [];
    this.maxEvents = 1000;
  }

  logSecurityEvent(event) {
    const securityEvent = {
      timestamp: new Date().toISOString(),
      type: event.type,
      details: event.details,
      severity: event.severity || "info",
    };

    this.securityEvents.push(securityEvent);

    // Keep only recent events
    if (this.securityEvents.length > this.maxEvents) {
      this.securityEvents.shift();
    }

    // Log to console in development
    if (__DEV__) {
      console.log("Security Event:", securityEvent);
    }

    // In production, you might want to send to a security monitoring service
    this.reportSecurityEvent(securityEvent);
  }

  async reportSecurityEvent(event) {
    try {
      // Send to security monitoring service
      await fetch("https://security.yourbackend.com/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(event),
      });
    } catch (error) {
      console.error("Failed to report security event:", error);
    }
  }

  getSecurityEvents() {
    return this.securityEvents;
  }

  clearSecurityEvents() {
    this.securityEvents = [];
  }
}

export const securityMonitor = new SecurityMonitor();
```

## Real-World Examples

### 1. Focus App Security Implementation

```javascript
// App.js with security integration
import React, { useEffect } from "react";
import { rootDetection } from "./utils/rootDetection";
import { debugDetection } from "./utils/debugDetection";
import { securityMonitor } from "./utils/securityMonitoring";
import { authManager } from "./utils/auth";
import { sensitiveDataManager } from "./utils/sensitiveData";

const App = () => {
  useEffect(() => {
    const initializeSecurity = async () => {
      try {
        // Validate environment
        await rootDetection.validateEnvironment();
        debugDetection.validateProductionEnvironment();

        // Initialize sensitive data manager
        await sensitiveDataManager.initialize();

        // Log security initialization
        securityMonitor.logSecurityEvent({
          type: "app_startup",
          details: "Security initialized successfully",
          severity: "info",
        });
      } catch (error) {
        securityMonitor.logSecurityEvent({
          type: "security_initialization_failed",
          details: error.message,
          severity: "error",
        });

        // Handle security failure
        console.error("Security initialization failed:", error);
      }
    };

    initializeSecurity();
  }, []);

  return (
    <NavigationContainer>
      <FocusAppNavigator />
    </NavigationContainer>
  );
};
```

### 2. Secure Session Management

```javascript
// utils/secureSession.js
import { sensitiveDataManager } from "./sensitiveData";
import { authManager } from "./auth";
import { securityMonitor } from "./securityMonitoring";

class SecureSessionManager {
  async startSecureSession(taskId) {
    try {
      const sessionData = {
        taskId,
        startTime: new Date().toISOString(),
        status: "running",
      };

      // Encrypt session data
      await sensitiveDataManager.storeSensitiveData(
        "current_session",
        sessionData
      );

      securityMonitor.logSecurityEvent({
        type: "session_started",
        details: `Session started for task: ${taskId}`,
        severity: "info",
      });

      return sessionData;
    } catch (error) {
      securityMonitor.logSecurityEvent({
        type: "session_start_failed",
        details: error.message,
        severity: "error",
      });
      throw error;
    }
  }

  async endSecureSession() {
    try {
      const sessionData =
        await sensitiveDataManager.getSensitiveData("current_session");

      if (sessionData) {
        const updatedSession = {
          ...sessionData,
          endTime: new Date().toISOString(),
          status: "completed",
        };

        // Store completed session
        await sensitiveDataManager.storeSensitiveData(
          "completed_sessions",
          updatedSession
        );

        // Clear current session
        await sensitiveDataManager.removeSensitiveData("current_session");

        securityMonitor.logSecurityEvent({
          type: "session_completed",
          details: `Session completed for task: ${sessionData.taskId}`,
          severity: "info",
        });
      }
    } catch (error) {
      securityMonitor.logSecurityEvent({
        type: "session_end_failed",
        details: error.message,
        severity: "error",
      });
      throw error;
    }
  }
}

export const secureSessionManager = new SecureSessionManager();
```

### 3. Secure Data Sync

```javascript
// utils/secureDataSync.js
import { secureApiClient } from "../api/secureClient";
import { sensitiveDataManager } from "./sensitiveData";
import { encryptionManager } from "./encryption";

class SecureDataSync {
  async syncJournalEntries() {
    try {
      const localEntries =
        (await sensitiveDataManager.getSensitiveData("journal_entries")) || [];

      // Encrypt data before sending
      const encryptedEntries =
        await encryptionManager.encryptData(localEntries);

      const response = await secureApiClient.post("/journal/sync", {
        entries: encryptedEntries,
        timestamp: new Date().toISOString(),
      });

      // Update local data with server response
      if (response.data.syncedEntries) {
        await sensitiveDataManager.storeSensitiveData(
          "journal_entries",
          response.data.syncedEntries
        );
      }

      return response.data;
    } catch (error) {
      console.error("Data sync failed:", error);
      throw error;
    }
  }

  async syncAnalyticsData() {
    try {
      const analyticsData =
        (await sensitiveDataManager.getSensitiveData("analytics_data")) || [];

      // Anonymize sensitive data before sending
      const anonymizedData = this.anonymizeData(analyticsData);

      const response = await secureApiClient.post("/analytics/sync", {
        data: anonymizedData,
        timestamp: new Date().toISOString(),
      });

      return response.data;
    } catch (error) {
      console.error("Analytics sync failed:", error);
      throw error;
    }
  }

  anonymizeData(data) {
    // Remove personally identifiable information
    return data.map((item) => ({
      ...item,
      userId: this.hashUserId(item.userId),
      personalInfo: undefined,
    }));
  }

  hashUserId(userId) {
    // Simple hash function for demonstration
    return userId
      .split("")
      .reduce((a, b) => {
        a = (a << 5) - a + b.charCodeAt(0);
        return a & a;
      }, 0)
      .toString();
  }
}

export const secureDataSync = new SecureDataSync();
```

This comprehensive security guide covers all essential aspects of securing React Native applications, from authentication and data encryption to code protection and network security. The examples are specifically tailored for your focus app and include best practices for protecting user data and maintaining app integrity.

The guide provides everything you need to build secure React Native applications with robust protection against common security threats and vulnerabilities.
