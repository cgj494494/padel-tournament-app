/**
 * StorageManager.js
 * 
 * Utility for managing persistent storage operations for the Padel Championship System.
 * Provides consistent error handling, data versioning, and storage key management.
 */

// Storage key constants
const STORAGE_KEYS = {
  // User and player-related keys
  USER_ID: 'padelUserId',
  PLAYERS: 'padelTournamentPlayers',
  
  // Championship-related keys
  CHAMPIONSHIPS: 'padelChampionships',
  CHAMPIONSHIP_SESSIONS_PREFIX: 'padelChampionshipSessions_',
  CHAMPIONSHIP_MATCHES_PREFIX: 'padelChampionshipMatches_',
  CHAMPIONSHIP_PERFORMANCE_PREFIX: 'padelChampionshipPerformance_',
  
  // Tournament-related keys (existing)
  TOURNAMENTS: 'padelTournaments',
  
  // Settings and configuration
  APP_SETTINGS: 'padelAppSettings',
  STORAGE_VERSION: 'padelStorageVersion'
};

// Current data version
const CURRENT_STORAGE_VERSION = '1.0.0';

/**
 * Main StorageManager object with utility functions
 */
const StorageManager = {
  /**
   * Initialize the storage system, check versions, run migrations if needed
   * @returns {boolean} Success status
   */
  initialize: () => {
    try {
      // Check storage version and run migrations if needed
      const currentVersion = localStorage.getItem(STORAGE_KEYS.STORAGE_VERSION);
      
      if (!currentVersion) {
        // First run, set initial version
        localStorage.setItem(STORAGE_KEYS.STORAGE_VERSION, CURRENT_STORAGE_VERSION);
      } else if (currentVersion !== CURRENT_STORAGE_VERSION) {
        // Run data migrations
        StorageManager.migrateData(currentVersion, CURRENT_STORAGE_VERSION);
        localStorage.setItem(STORAGE_KEYS.STORAGE_VERSION, CURRENT_STORAGE_VERSION);
      }
      
      return true;
    } catch (error) {
      console.error('Storage initialization failed:', error);
      return false;
    }
  },
  
  /**
   * Save an item to storage with error handling
   * @param {string} key - Storage key
   * @param {any} data - Data to store (will be JSON stringified)
   * @returns {boolean} Success status
   */
  saveItem: (key, data) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error(`Error saving data to ${key}:`, error);
      
      // Check if it's a quota exceeded error
      if (error instanceof DOMException && error.code === 22) {
        StorageManager.handleStorageFullError();
      }
      
      return false;
    }
  },
  
  /**
   * Load an item from storage with error handling
   * @param {string} key - Storage key
   * @param {any} defaultValue - Default value if key doesn't exist
   * @returns {any} Parsed data or default value
   */
  loadItem: (key, defaultValue = null) => {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
      console.error(`Error loading data from ${key}:`, error);
      return defaultValue;
    }
  },
  
  /**
   * Remove an item from storage
   * @param {string} key - Storage key to remove
   * @returns {boolean} Success status
   */
  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing item ${key}:`, error);
      return false;
    }
  },
  
  /**
   * Check if a key exists in storage
   * @param {string} key - Storage key to check
   * @returns {boolean} True if key exists
   */
  hasItem: (key) => {
    return localStorage.getItem(key) !== null;
  },
  
  /**
   * Get all matching keys with a prefix
   * @param {string} prefix - Key prefix to match
   * @returns {string[]} Array of matching keys
   */
  getKeysByPrefix: (prefix) => {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        keys.push(key);
      }
    }
    return keys;
  },
  
  /**
   * Clear all application data - use with caution!
   * @param {boolean} confirmationFlag - Safety flag to prevent accidental clearing
   * @returns {boolean} Success status
   */
  clearAllData: (confirmationFlag = false) => {
    if (!confirmationFlag) {
      console.warn('clearAllData was called without confirmation flag. No data was deleted.');
      return false;
    }
    
    try {
      // Only clear our app's data, not everything in localStorage
      const allKeys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('padel') || Object.values(STORAGE_KEYS).includes(key))) {
          allKeys.push(key);
        }
      }
      
      // Remove each key
      allKeys.forEach(key => localStorage.removeItem(key));
      return true;
    } catch (error) {
      console.error('Error clearing all data:', error);
      return false;
    }
  },
  
  /**
   * Export all application data as a JSON string
   * @returns {string|null} JSON string of all data or null on error
   */
  exportAllData: () => {
    try {
      const exportData = {
        version: CURRENT_STORAGE_VERSION,
        timestamp: new Date().toISOString(),
        data: {}
      };
      
      // Export all app data
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('padel') || Object.values(STORAGE_KEYS).includes(key))) {
          try {
            exportData.data[key] = JSON.parse(localStorage.getItem(key));
          } catch (e) {
            // If not JSON, store as string
            exportData.data[key] = localStorage.getItem(key);
          }
        }
      }
      
      return JSON.stringify(exportData);
    } catch (error) {
      console.error('Error exporting data:', error);
      return null;
    }
  },
  
  /**
   * Import data from a previously exported JSON string
   * @param {string} jsonData - JSON string from exportAllData
   * @param {boolean} clearFirst - Whether to clear existing data first
   * @returns {boolean} Success status
   */
  importData: (jsonData, clearFirst = false) => {
    try {
      const importData = JSON.parse(jsonData);
      
      if (!importData || !importData.data || !importData.version) {
        throw new Error('Invalid import data format');
      }
      
      // Optionally clear existing data
      if (clearFirst) {
        StorageManager.clearAllData(true);
      }
      
      // Import all data
      Object.entries(importData.data).forEach(([key, value]) => {
        localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
      });
      
      // Update version if needed
      if (importData.version !== CURRENT_STORAGE_VERSION) {
        StorageManager.migrateData(importData.version, CURRENT_STORAGE_VERSION);
        localStorage.setItem(STORAGE_KEYS.STORAGE_VERSION, CURRENT_STORAGE_VERSION);
      }
      
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  },
  
  /**
   * Get estimated storage usage information
   * @returns {Object} Storage usage info
   */
  getStorageInfo: () => {
    try {
      let totalSize = 0;
      let appSize = 0;
      const appKeyCount = 0;
      
      // Calculate total and app-specific usage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key);
        const size = (key.length + value.length) * 2; // UTF-16 uses 2 bytes per character
        
        totalSize += size;
        
        if (key && (key.startsWith('padel') || Object.values(STORAGE_KEYS).includes(key))) {
          appSize += size;
          appKeyCount++;
        }
      }
      
      return {
        totalSize: totalSize,
        appSize: appSize,
        appKeyCount: appKeyCount,
        unit: 'bytes',
        percentUsed: (appSize / totalSize) * 100
      };
    } catch (error) {
      console.error('Error calculating storage info:', error);
      return {
        error: 'Failed to calculate storage info',
        totalSize: 0,
        appSize: 0,
        appKeyCount: 0
      };
    }
  },
  
  /**
   * Handle storage quota exceeded errors
   * @private
   */
  handleStorageFullError: () => {
    // Create a friendly user notification
    const message = `
      Storage space is full. Please try:
      1. Exporting your data as a backup
      2. Clearing old tournaments or championships you no longer need
      3. If problems persist, contact support
    `;
    
    // Log to console
    console.error('STORAGE QUOTA EXCEEDED');
    console.error(message);
    
    // Return the message so the UI can display it
    return {
      error: 'STORAGE_FULL',
      message
    };
  },
  
  /**
   * Run data migrations between versions
   * @param {string} fromVersion - Current version
   * @param {string} toVersion - Target version
   * @private
   */
  migrateData: (fromVersion, toVersion) => {
    console.log(`Migrating data from ${fromVersion} to ${toVersion}`);
    
    // Migration logic will be implemented as needed
    // For now, this is a placeholder for future migrations
    
    // Example migration step:
    // if (fromVersion === '1.0.0' && toVersion === '1.1.0') {
    //   // Migration from 1.0.0 to 1.1.0
    // }
  },
  
  // Championship-specific helpers
  
  /**
   * Save a championship
   * @param {Object} championship - Championship data
   * @returns {boolean} Success status
   */
  saveChampionship: (championship) => {
    // First load all championships
    const championships = StorageManager.loadChampionships();
    
    // Find and update or add
    const index = championships.findIndex(c => c.id === championship.id);
    if (index !== -1) {
      championships[index] = championship;
    } else {
      championships.push(championship);
    }
    
    // Save back
    return StorageManager.saveItem(STORAGE_KEYS.CHAMPIONSHIPS, championships);
  },
  
  /**
   * Load all championships
   * @returns {Array} Array of championships
   */
  loadChampionships: () => {
    return StorageManager.loadItem(STORAGE_KEYS.CHAMPIONSHIPS, []);
  },
  
  /**
   * Get a specific championship by ID
   * @param {string} id - Championship ID
   * @returns {Object|null} Championship or null if not found
   */
  getChampionshipById: (id) => {
    const championships = StorageManager.loadChampionships();
    return championships.find(c => c.id === id) || null;
  },
  
  /**
   * Delete a championship and all related data
   * @param {string} id - Championship ID
   * @returns {boolean} Success status
   */
  deleteChampionship: (id) => {
    try {
      // Remove championship from the list
      const championships = StorageManager.loadChampionships().filter(c => c.id !== id);
      StorageManager.saveItem(STORAGE_KEYS.CHAMPIONSHIPS, championships);
      
      // Delete related data (sessions, matches, performance)
      const sessionsKey = `${STORAGE_KEYS.CHAMPIONSHIP_SESSIONS_PREFIX}${id}`;
      const matchesKey = `${STORAGE_KEYS.CHAMPIONSHIP_MATCHES_PREFIX}${id}`;
      const performanceKey = `${STORAGE_KEYS.CHAMPIONSHIP_PERFORMANCE_PREFIX}${id}`;
      
      StorageManager.removeItem(sessionsKey);
      StorageManager.removeItem(matchesKey);
      StorageManager.removeItem(performanceKey);
      
      return true;
    } catch (error) {
      console.error(`Error deleting championship ${id}:`, error);
      return false;
    }
  },
  
  // Session-specific helpers
  
  /**
   * Save sessions for a championship
   * @param {string} championshipId - Championship ID
   * @param {Array} sessions - Array of session objects
   * @returns {boolean} Success status
   */
  saveChampionshipSessions: (championshipId, sessions) => {
    const key = `${STORAGE_KEYS.CHAMPIONSHIP_SESSIONS_PREFIX}${championshipId}`;
    return StorageManager.saveItem(key, sessions);
  },
  
  /**
   * Load sessions for a championship
   * @param {string} championshipId - Championship ID
   * @returns {Array} Array of session objects
   */
  loadChampionshipSessions: (championshipId) => {
    const key = `${STORAGE_KEYS.CHAMPIONSHIP_SESSIONS_PREFIX}${championshipId}`;
    return StorageManager.loadItem(key, []);
  },
  
  // Match-specific helpers
  
  /**
   * Save matches for a championship
   * @param {string} championshipId - Championship ID
   * @param {Array} matches - Array of match objects
   * @returns {boolean} Success status
   */
  saveChampionshipMatches: (championshipId, matches) => {
    const key = `${STORAGE_KEYS.CHAMPIONSHIP_MATCHES_PREFIX}${championshipId}`;
    return StorageManager.saveItem(key, matches);
  },
  
  /**
   * Load matches for a championship
   * @param {string} championshipId - Championship ID
   * @returns {Array} Array of match objects
   */
  loadChampionshipMatches: (championshipId) => {
    const key = `${STORAGE_KEYS.CHAMPIONSHIP_MATCHES_PREFIX}${championshipId}`;
    return StorageManager.loadItem(key, []);
  },
  
  /**
   * Add or update a match in a championship
   * @param {string} championshipId - Championship ID
   * @param {Object} match - Match object
   * @returns {boolean} Success status
   */
  saveMatch: (championshipId, match) => {
    const matches = StorageManager.loadChampionshipMatches(championshipId);
    
    // Find and update or add
    const index = matches.findIndex(m => m.id === match.id);
    if (index !== -1) {
      matches[index] = match;
    } else {
      matches.push(match);
    }
    
    // Save back
    return StorageManager.saveChampionshipMatches(championshipId, matches);
  },
  
  // Performance-specific helpers
  
  /**
   * Save performance records for a championship
   * @param {string} championshipId - Championship ID
   * @param {Object} performanceRecords - Performance records object (keyed by player ID)
   * @returns {boolean} Success status
   */
  saveChampionshipPerformance: (championshipId, performanceRecords) => {
    const key = `${STORAGE_KEYS.CHAMPIONSHIP_PERFORMANCE_PREFIX}${championshipId}`;
    return StorageManager.saveItem(key, performanceRecords);
  },
  
  /**
   * Load performance records for a championship
   * @param {string} championshipId - Championship ID
   * @returns {Object} Performance records object (keyed by player ID)
   */
  loadChampionshipPerformance: (championshipId) => {
    const key = `${STORAGE_KEYS.CHAMPIONSHIP_PERFORMANCE_PREFIX}${championshipId}`;
    return StorageManager.loadItem(key, {});
  },
  
  /**
   * Get a player's performance record for a championship
   * @param {string} championshipId - Championship ID
   * @param {string} playerId - Player ID
   * @returns {Object|null} Performance record or null if not found
   */
  getPlayerPerformance: (championshipId, playerId) => {
    const records = StorageManager.loadChampionshipPerformance(championshipId);
    return records[playerId] || null;
  },
  
  /**
   * Update a player's performance record
   * @param {string} championshipId - Championship ID
   * @param {string} playerId - Player ID
   * @param {Object} performanceData - Performance data
   * @returns {boolean} Success status
   */
  updatePlayerPerformance: (championshipId, playerId, performanceData) => {
    const records = StorageManager.loadChampionshipPerformance(championshipId);
    records[playerId] = performanceData;
    return StorageManager.saveChampionshipPerformance(championshipId, records);
  },
  
  // Player-specific helpers (compatible with existing player management)
  
  /**
   * Load all players
   * @returns {Array} Array of player objects
   */
  loadPlayers: () => {
    return StorageManager.loadItem(STORAGE_KEYS.PLAYERS, []);
  },
  
  /**
   * Save players
   * @param {Array} players - Array of player objects
   * @returns {boolean} Success status
   */
  savePlayers: (players) => {
    return StorageManager.saveItem(STORAGE_KEYS.PLAYERS, players);
  },
  
  /**
   * Get a player by ID
   * @param {string} id - Player ID
   * @returns {Object|null} Player or null if not found
   */
  getPlayerById: (id) => {
    const players = StorageManager.loadPlayers();
    return players.find(p => p.id === id) || null;
  }
};

export { StorageManager, STORAGE_KEYS };
