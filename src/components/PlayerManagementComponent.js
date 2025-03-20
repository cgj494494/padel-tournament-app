import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { v4 as uuidv4 } from 'uuid';

// Player Management Modal Component
const PlayerManagementModal = ({ 
  isOpen, 
  onClose, 
  players, 
  onAddPlayer, 
  onUpdatePlayer, 
  onDeletePlayer 
}) => {
  const [newPlayer, setNewPlayer] = useState({
    firstName: '',
    surname: '',
    userId: '',
    isActive: true
  });
  const [editingPlayer, setEditingPlayer] = useState(null);

  if (!isOpen) return null;

  const validateName = (name) => {
    // Trim and validate name
    const trimmedName = name.trim();
    return trimmedName.length >= 2 && 
           trimmedName.length <= 50 && 
           /^[A-Za-z\s-]+$/.test(trimmedName);
  };

  const validateUserId = (userId) => {
    // Alphanumeric, at least 3 characters
    return /^[A-Za-z0-9]{3,20}$/.test(userId);
  };

  const handleSave = () => {
    // Validate inputs
    if (!validateName(newPlayer.firstName) || 
        !validateName(newPlayer.surname) || 
        !validateUserId(newPlayer.userId)) {
      alert('Please check your input. Names must be 2-50 letters, spaces, or hyphens. User ID must be 3-20 alphanumeric characters.');
      return;
    }

    // Check for duplicate user ID
    const isDuplicateUserId = players.some(p => 
      p.userId.toLowerCase() === newPlayer.userId.toLowerCase() && 
      (!editingPlayer || p.id !== editingPlayer.id)
    );

    if (isDuplicateUserId) {
      alert('User ID must be unique.');
      return;
    }

    const playerToSave = {
      ...newPlayer,
      firstName: newPlayer.firstName.trim(),
      surname: newPlayer.surname.trim(),
      userId: newPlayer.userId.trim().toUpperCase()
    };

    if (editingPlayer) {
      // Update existing player
      onUpdatePlayer({
        ...playerToSave,
        id: editingPlayer.id
      });
    } else {
      // Add new player
      onAddPlayer({
        ...playerToSave,
        id: uuidv4(),
        totalTournaments: 0,
        totalPoints: 0,
        gamesWon: 0,
        gamesLost: 0,
        gameDifferential: 0
      });
    }

    // Reset form
    setNewPlayer({
      firstName: '',
      surname: '',
      userId: '',
      isActive: true
    });
    setEditingPlayer(null);
    onClose();
  };

  const startEditing = (player) => {
    setEditingPlayer(player);
    setNewPlayer({
      firstName: player.firstName,
      surname: player.surname,
      userId: player.userId,
      isActive: player.isActive
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 m-4">
        <h2 className="text-2xl font-bold mb-6 text-blue-800">
          {editingPlayer ? 'Edit Player' : 'Add New Player'}
        </h2>

        {/* Player Input Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
            <input
              type="text"
              value={newPlayer.firstName}
              onChange={(e) => setNewPlayer(prev => ({
                ...prev, 
                firstName: e.target.value
              }))}
              placeholder="Enter first name"
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Surname</label>
            <input
              type="text"
              value={newPlayer.surname}
              onChange={(e) => setNewPlayer(prev => ({
                ...prev, 
                surname: e.target.value
              }))}
              placeholder="Enter surname"
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
            <input
              type="text"
              value={newPlayer.userId}
              onChange={(e) => setNewPlayer(prev => ({
                ...prev, 
                userId: e.target.value
              }))}
              placeholder="Enter unique user ID"
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              checked={newPlayer.isActive}
              onChange={(e) => setNewPlayer(prev => ({
                ...prev, 
                isActive: e.target.checked
              }))}
              className="mr-2"
            />
            <label className="text-sm text-gray-700">
              Active for tournaments
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white"
          >
            Save
          </button>
        </div>

        {/* Player List (if editing) */}
        {!editingPlayer && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3 text-blue-800">Existing Players</h3>
            <div className="max-h-40 overflow-y-auto border rounded">
              {players.map(player => (
                <div 
                  key={player.id} 
                  className="flex justify-between items-center p-2 hover:bg-gray-100 border-b"
                >
                  <div>
                    <span className="font-medium">{player.firstName} {player.surname}</span>
                    <span className="text-sm text-gray-500 ml-2">{player.userId}</span>
                  </div>
                  <button
                    onClick={() => startEditing(player)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Player Management Utilities
const PlayerManagementUtils = {
  // Save players to localStorage
  savePlayers: (players) => {
    try {
      localStorage.setItem('padelTournamentPlayers', JSON.stringify(players));
    } catch (error) {
      console.error('Error saving players:', error);
      alert('Failed to save players. Storage might be full.');
    }
  },

  // Load players from localStorage
  loadPlayers: () => {
    try {
      const savedPlayers = localStorage.getItem('padelTournamentPlayers');
      return savedPlayers ? JSON.parse(savedPlayers) : [];
    } catch (error) {
      console.error('Error loading players:', error);
      return [];
    }
  },

  // Export players to CSV
  exportPlayersToCSV: (players) => {
    const headers = [
      'First Name', 
      'Surname', 
      'User ID', 
      'Active', 
      'Total Tournaments', 
      'Total Points', 
      'Games Won', 
      'Games Lost', 
      'Game Differential'
    ];

    const csvContent = [
      headers.join(','),
      ...players.map(player => [
        player.firstName,
        player.surname,
        player.userId,
        player.isActive,
        player.totalTournaments || 0,
        player.totalPoints || 0,
        player.gamesWon || 0,
        player.gamesLost || 0,
        player.gameDifferential || 0
      ].map(value => `"${value}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `padel_players_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  // Import players from CSV
  importPlayersFromCSV: (file, existingPlayers, onImportComplete) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());

      const importedPlayers = lines.slice(1)
        .filter(line => line.trim() !== '')
        .map(line => {
          const values = line.split(',').map(v => v.replace(/"/g, '').trim());
          const playerObj = {};
          
          headers.forEach((header, index) => {
            switch(header.toLowerCase()) {
              case 'first name': playerObj.firstName = values[index]; break;
              case 'surname': playerObj.surname = values[index]; break;
              case 'user id': playerObj.userId = values[index]; break;
              case 'active': playerObj.isActive = values[index] === 'true'; break;
              case 'total tournaments': playerObj.totalTournaments = parseInt(values[index]) || 0; break;
              case 'total points': playerObj.totalPoints = parseInt(values[index]) || 0; break;
              case 'games won': playerObj.gamesWon = parseInt(values[index]) || 0; break;
              case 'games lost': playerObj.gamesLost = parseInt(values[index]) || 0; break;
              case 'game differential': playerObj.gameDifferential = parseInt(values[index]) || 0; break;
            }
          });

          // Add unique ID if not present
          playerObj.id = uuidv4();

          return playerObj;
        });

      // Merge with existing players, avoiding duplicates
      const mergedPlayers = [...existingPlayers];
      importedPlayers.forEach(newPlayer => {
        const isDuplicate = mergedPlayers.some(
          p => p.userId.toLowerCase() === newPlayer.userId.toLowerCase()
        );
        
        if (!isDuplicate) {
          mergedPlayers.push(newPlayer);
        }
      });

      // Save merged players
      PlayerManagementUtils.savePlayers(mergedPlayers);
      
      // Callback with import results
      onImportComplete(importedPlayers.length, mergedPlayers.length);
    };
    reader.readAsText(file);
  }
};

export { PlayerManagementModal, PlayerManagementUtils };
