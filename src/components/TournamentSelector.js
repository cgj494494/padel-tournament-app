import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import PlayerSelectionView from './PlayerSelectionView';

// DeleteConfirmationModal remains unchanged from your original implementation
const DeleteConfirmationModal = ({ isOpen, tournamentName, onCancel, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 m-4 transform transition-all">
        <h3 className="text-xl font-bold mb-4 text-gray-800">Delete Tournament?</h3>
        <p className="mb-6 text-gray-600">
          Are you sure you want to delete "<span className="font-semibold text-gray-800">{tournamentName}</span>"?
          This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-medium text-white transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// Enhanced Tournament Selector Component with Player Selection
const TournamentSelector = ({ tournaments, onCreateTournament, onLoadTournament, onDeleteTournament }) => {
  const [newTournamentName, setNewTournamentName] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [currentTournament, setCurrentTournament] = useState(null);
  
  // New states for player selection workflow
  const [creationStep, setCreationStep] = useState('naming'); // 'naming', 'playerSelection'
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [pendingTournamentName, setPendingTournamentName] = useState('');

  // Handle starting the tournament creation process
  const handleStartCreation = () => {
    if (newTournamentName.trim()) {
      setCreationStep('playerSelection');
      setPendingTournamentName(newTournamentName);
      setNewTournamentName('');
    }
  };
  
  // Handle player selection completion
  const handlePlayersSelected = (players) => {
    setSelectedPlayers(players);
    
    // Create tournament with the selected players
    onCreateTournament(pendingTournamentName, players);
    
    // Reset creation workflow
    setCreationStep('naming');
    setPendingTournamentName('');
    setSelectedPlayers([]);
  };
  
  // Handle cancellation of player selection
  const handleCancelPlayerSelection = () => {
    setCreationStep('naming');
    setPendingTournamentName('');
    setSelectedPlayers([]);
  };

  // Create a function to build matches based on selected players
  const buildTournamentMatches = (players) => {
    // This is a placeholder for the tournament scheduling algorithm
    // In a real implementation, this would create a balanced schedule
    // ensuring each player plays with every other player
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 max-w-3xl mx-auto mt-10">
      <h2 className="text-3xl font-bold text-center mb-8 text-blue-800">Padel Tournament Manager</h2>

      {/* Step 1: Tournament Naming (only shown in naming step) */}
      {creationStep === 'naming' && (
        <div className="mb-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="text-2xl font-bold mb-4">Create New Tournament</h3>
          <div className="flex items-center gap-4">
            <input
              type="text"
              value={newTournamentName}
              onChange={(e) => setNewTournamentName(e.target.value)}
              placeholder="Tournament Name"
              className="flex-1 px-4 py-2 text-lg border rounded-lg"
            />
            <button
              onClick={handleStartCreation}
              disabled={!newTournamentName.trim()}
              className="px-6 py-2 text-lg font-bold bg-blue-600 text-white rounded-lg disabled:bg-gray-400"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Player Selection (only shown in playerSelection step) */}
      {creationStep === 'playerSelection' && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={handleCancelPlayerSelection}
              className="flex items-center text-blue-600 hover:text-blue-800"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <h3 className="text-xl font-bold text-blue-800">
              New Tournament: {pendingTournamentName}
            </h3>
          </div>
          
          <PlayerSelectionView 
            onPlayersSelected={handlePlayersSelected}
            minPlayers={5}  // Set your minimum according to tournament requirements
            maxPlayers={16} // Set your maximum according to tournament requirements
          />
        </div>
      )}

      {/* Load existing tournament section (always visible) */}
      {creationStep === 'naming' && (
        <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-2xl font-bold mb-4">Load Existing Tournament</h3>

          {tournaments.length === 0 ? (
            <p className="text-gray-500 italic text-center py-4">No saved tournaments</p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {tournaments.map((tournament) => (
                <div
                  key={tournament.id}
                  onClick={() => onLoadTournament(tournament)}
                  className="p-4 bg-white rounded-lg border border-gray-200 flex justify-between items-center cursor-pointer hover:bg-blue-50"
                >
                  <div>
                    <div className="font-bold text-xl">{tournament.name}</div>
                    <div className="text-sm text-gray-500">{tournament.date}</div>
                    <div className="text-sm text-blue-600 mt-1">
                      {tournament.players ? `${tournament.players.length} players` : '9 players'}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentTournament(tournament);
                      setShowConfirm(true);
                    }}
                    className="flex items-center px-3 py-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                    aria-label="Delete tournament"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span className="font-medium">Delete</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showConfirm && currentTournament && (
        <DeleteConfirmationModal
          isOpen={showConfirm}
          tournamentName={currentTournament.name}
          onCancel={() => setShowConfirm(false)}
          onConfirm={() => {
            onDeleteTournament(currentTournament.id);
            setShowConfirm(false);
          }}
        />
      )}
    </div>
  );
};

export default TournamentSelector;
