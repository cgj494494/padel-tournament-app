import React, { useState, useEffect } from 'react';
import { PlayerManagementModal, PlayerManagementUtils } from './PlayerManagementComponent';

/**
 * PlayerSelectionView Component
 * 
 * This component handles:
 * 1. Displaying available players from the player database
 * 2. Allowing selection of players for a tournament
 * 3. Adding new players via the PlayerManagementModal
 * 4. Validating player selection (min/max players)
 */
const PlayerSelectionView = ({ 
  onPlayersSelected, 
  minPlayers = 5,
  maxPlayers = 16,
  initialSelectedPlayers = []
}) => {
  // State for all available players from the database
  const [allPlayers, setAllPlayers] = useState([]);
  
  // State for selected players for this tournament
  const [selectedPlayers, setSelectedPlayers] = useState(initialSelectedPlayers);
  
  // State for player management modal
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  
  // State for validation error messages
  const [errorMessage, setErrorMessage] = useState('');
  
  // Load players from localStorage on component mount
  useEffect(() => {
    const loadedPlayers = PlayerManagementUtils.loadPlayers();
    // Filter to only show active players
    const activePlayers = loadedPlayers.filter(player => player.isActive);
    setAllPlayers(activePlayers);
  }, []);

  // Handle player selection toggle
  const togglePlayerSelection = (player) => {
    setErrorMessage(''); // Clear any error messages
    
    const isSelected = selectedPlayers.some(p => p.id === player.id);
    
    if (isSelected) {
      // Remove player if already selected
      setSelectedPlayers(prev => prev.filter(p => p.id !== player.id));
    } else {
      // Add player if not at max players
      if (selectedPlayers.length < maxPlayers) {
        setSelectedPlayers(prev => [...prev, player]);
      } else {
        setErrorMessage(`Maximum of ${maxPlayers} players allowed`);
      }
    }
  };
  
  // Handle submitting the selected players
  const handleSubmitSelection = () => {
    if (selectedPlayers.length < minPlayers) {
      setErrorMessage(`At least ${minPlayers} players required`);
      return;
    }
    
    // Call the callback with selected players
    onPlayersSelected(selectedPlayers);
  };
  
  // Handle adding a new player
  const handleAddPlayer = (newPlayer) => {
    // Add player to allPlayers
    setAllPlayers(prev => [...prev, newPlayer]);
    
    // Save updated players to localStorage
    PlayerManagementUtils.savePlayers([...allPlayers, newPlayer]);
  };
  
  // Handle updating a player
  const handleUpdatePlayer = (updatedPlayer) => {
    // Update player in allPlayers
    setAllPlayers(prev => 
      prev.map(p => p.id === updatedPlayer.id ? updatedPlayer : p)
    );
    
    // Update in selectedPlayers if selected
    setSelectedPlayers(prev => 
      prev.map(p => p.id === updatedPlayer.id ? updatedPlayer : p)
    );
    
    // Save updated players to localStorage
    PlayerManagementUtils.savePlayers(
      allPlayers.map(p => p.id === updatedPlayer.id ? updatedPlayer : p)
    );
  };
  
  // Render player card with selection state
  const renderPlayerCard = (player) => {
    const isSelected = selectedPlayers.some(p => p.id === player.id);
    
    return (
      <div 
        key={player.id}
        onClick={() => togglePlayerSelection(player)}
        className={`
          p-4 rounded-lg border-2 mb-3 cursor-pointer transition-colors
          ${isSelected 
            ? 'bg-blue-100 border-blue-500' 
            : 'bg-white border-gray-200 hover:bg-gray-50'}
        `}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="font-bold text-lg">
              {player.firstName} {player.surname}
            </div>
            <div className="text-sm text-gray-500">
              ID: {player.userId}
            </div>
          </div>
          
          {/* Selection Checkbox */}
          <div className={`
            w-6 h-6 rounded-full flex items-center justify-center
            ${isSelected ? 'bg-blue-500 text-white' : 'border-2 border-gray-300'}
          `}>
            {isSelected && (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6 text-blue-800">Select Players</h2>
      
      {/* Selection status */}
      <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-blue-800">
          <span className="font-bold">{selectedPlayers.length}</span> of <span className="font-bold">{maxPlayers}</span> players selected
          {selectedPlayers.length < minPlayers && (
            <span className="text-amber-600 ml-2">
              (Minimum {minPlayers} required)
            </span>
          )}
        </p>
      </div>
      
      {/* Error message display */}
      {errorMessage && (
        <div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-200 text-red-600">
          {errorMessage}
        </div>
      )}
      
      {/* Player selection list */}
      <div className="mb-6 max-h-96 overflow-y-auto">
        {allPlayers.length === 0 ? (
          <p className="text-gray-500 italic text-center py-4">
            No players available. Add your first player below.
          </p>
        ) : (
          allPlayers.map(player => renderPlayerCard(player))
        )}
      </div>
      
      {/* Add new player and continue buttons */}
      <div className="flex justify-between">
        <button
          onClick={() => setShowPlayerModal(true)}
          className="px-4 py-2 flex items-center bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add New Player
        </button>
        
        <button
          onClick={handleSubmitSelection}
          disabled={selectedPlayers.length < minPlayers}
          className={`
            px-4 py-2 font-bold text-white rounded-lg
            ${selectedPlayers.length >= minPlayers
              ? 'bg-blue-600 hover:bg-blue-700'
              : 'bg-gray-400 cursor-not-allowed'}
          `}
        >
          Continue with Selected Players
        </button>
      </div>
      
      {/* Player Management Modal */}
      <PlayerManagementModal
        isOpen={showPlayerModal}
        onClose={() => setShowPlayerModal(false)}
        players={allPlayers}
        onAddPlayer={handleAddPlayer}
        onUpdatePlayer={handleUpdatePlayer}
        onDeletePlayer={() => {}} // Implement if needed
      />
    </div>
  );
};

export default PlayerSelectionView;
