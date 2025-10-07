import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { RoleProvider } from './components/RoleBasedWrapper';
import PadelTournamentApp from './components/PadelTournamentApp';
import ChampionshipManagement from './components/ChampionshipManagement';
import { PlayerManagementModal, PlayerManagementUtils } from './components/PlayerManagementComponent';
import './index.css';
import * as XLSX from 'xlsx';

// Function to save the last used item
export const saveLastUsedItem = (itemId, itemName, itemType) => {
  const lastUsed = {
    id: itemId,
    name: itemName,
    type: itemType, // 'championship', 'tournament', or 'players'
    timestamp: Date.now()
  };
  localStorage.setItem('padelManagerLastUsed', JSON.stringify(lastUsed));
};
// Helper function to format dates as dd/mm/yy
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear()).slice(-2);
  return `${day}/${month}/${year}`;
};

// Helper function to get player name
const getPlayerName = (playerId, players) => {
  const player = players.find(p => p.id === playerId);
  return player ? `${player.firstName} ${player.surname}` : 'Unknown';
};

// Export Championship to Excel
const exportChampionshipToExcel = (championship, players) => {
  const wb = XLSX.utils.book_new();

  // SHEET 1: Match Summary
  const matchData = championship.matches.map(match => ({
    'Date': formatDate(match.date),
    'Team A Player 1': getPlayerName(match.teamA[0], players),
    'Team A Player 2': getPlayerName(match.teamA[1], players),
    'Team B Player 1': getPlayerName(match.teamB[0], players),
    'Team B Player 2': getPlayerName(match.teamB[1], players),
    'Score A': match.gamesA,
    'Score B': match.gamesB,
    'Points A': match.points.teamA,
    'Points B': match.points.teamB,
    'Complete': match.isComplete ? 'Yes' : 'No'
  }));

  const matchSheet = XLSX.utils.json_to_sheet(matchData);
  XLSX.utils.book_append_sheet(wb, matchSheet, "Matches");

  // SHEET 2: Standings
  const standingsData = championship.standings.map(standing => {
    const player = players.find(p => p.id === standing.playerId);
    return {
      'Player': player ? `${player.firstName} ${player.surname}` : 'Unknown',
      'Points': standing.points,
      'Matches': standing.matchesPlayed,
      'Wins': standing.matchesWon,
      'Games Won': standing.gamesWon,
      'Games Lost': standing.gamesLost,
      'Game Diff': (standing.gamesWon || 0) - (standing.gamesLost || 0)
    };
  }).sort((a, b) => b.Points - a.Points); // Sort by points descending

  const standingsSheet = XLSX.utils.json_to_sheet(standingsData);
  XLSX.utils.book_append_sheet(wb, standingsSheet, "Standings");

  // SHEET 3: Championship Info
  const infoData = [{
    'Championship Name': championship.name,
    'Start Date': formatDate(championship.startDate),
    'Total Players': championship.players.length,
    'Total Matches': championship.matches.length,
    'Scoring System': championship.settings?.scoringSystem || 'CJ Updated 2025',
    'Export Date': formatDate(new Date().toISOString())
  }];

  const infoSheet = XLSX.utils.json_to_sheet(infoData);
  XLSX.utils.book_append_sheet(wb, infoSheet, "Championship Info");

  // Generate filename and download
  const filename = `${championship.name.replace(/\s+/g, '_')}_${formatDate(new Date().toISOString()).replace(/\//g, '-')}.xlsx`;
  XLSX.writeFile(wb, filename);
};

// Export Player to Excel
const exportPlayerToExcel = (playerId, championships, players) => {
  const player = players.find(p => p.id === playerId);
  if (!player) return;

  const wb = XLSX.utils.book_new();

  // Gather all matches for this player
  let playerMatches = [];
  championships.forEach(championship => {
    championship.matches.forEach(match => {
      if (match.teamA.includes(playerId) || match.teamB.includes(playerId)) {
        const isTeamA = match.teamA.includes(playerId);
        const partnerId = isTeamA
          ? match.teamA.find(id => id !== playerId)
          : match.teamB.find(id => id !== playerId);
        const opponentIds = isTeamA ? match.teamB : match.teamA;
        const playerPoints = isTeamA ? match.points.teamA : match.points.teamB;
        const opponentPoints = isTeamA ? match.points.teamB : match.points.teamA;
        const won = playerPoints > opponentPoints;
        const score = isTeamA
          ? `${match.gamesA}-${match.gamesB}`
          : `${match.gamesB}-${match.gamesA}`;

        playerMatches.push({
          'Date': formatDate(match.date),
          'Championship': championship.name,
          'Partner': getPlayerName(partnerId, players),
          'Opponent 1': getPlayerName(opponentIds[0], players),
          'Opponent 2': getPlayerName(opponentIds[1], players),
          'Score': score,
          'Result': won ? 'Win' : 'Loss',
          'CJ Points': playerPoints,
          'Complete': match.isComplete ? 'Yes' : 'No'
        });
      }
    });
  });

  // SHEET 1: Player Summary
  const wins = playerMatches.filter(m => m.Result === 'Win').length;
  const losses = playerMatches.filter(m => m.Result === 'Loss').length;
  const totalPoints = playerMatches.reduce((sum, m) => sum + m['CJ Points'], 0);
  const winRate = playerMatches.length > 0 ? ((wins / playerMatches.length) * 100).toFixed(1) : '0.0';

  const summaryData = [{
    'Player Name': `${player.firstName} ${player.surname}`,
    'Total Matches': playerMatches.length,
    'Wins': wins,
    'Losses': losses,
    'Win Rate': `${winRate}%`,
    'Total CJ Points': totalPoints,
    'Avg Points/Match': playerMatches.length > 0 ? (totalPoints / playerMatches.length).toFixed(1) : '0.0',
    'Export Date': formatDate(new Date().toISOString())
  }];

  const summarySheet = XLSX.utils.json_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, summarySheet, "Player Summary");

  // SHEET 2: Match History
  const historySheet = XLSX.utils.json_to_sheet(playerMatches);
  XLSX.utils.book_append_sheet(wb, historySheet, "Match History");

  // Generate filename and download
  const filename = `${player.firstName}_${player.surname}_${formatDate(new Date().toISOString()).replace(/\//g, '-')}.xlsx`;
  XLSX.writeFile(wb, filename);
};
// Fixed PlayerManagementView Component in App.js
const PlayerManagementView = ({ saveLastUsed }) => {
  const [players, setPlayers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);

  useEffect(() => {
    loadPlayers();
    if (saveLastUsed) {
      saveLastUsed('players', 'Player Management', 'players');
    }
  }, [saveLastUsed]);

  const loadPlayers = () => {
    const loadedPlayers = PlayerManagementUtils.loadPlayers();
    setPlayers(loadedPlayers);
  };

  const handleAddPlayer = (playerData) => {
    const newPlayer = {
      id: Date.now().toString(),
      ...playerData,
      totalTournaments: 0,
      totalPoints: 0,
      gamesWon: 0,
      gamesLost: 0,
      gameDifferential: 0
    };
    const updatedPlayers = [...players, newPlayer];
    PlayerManagementUtils.savePlayers(updatedPlayers);
    setPlayers(updatedPlayers);
  };

  const handleUpdatePlayer = (updatedPlayer) => {
    const updatedPlayers = players.map(p =>
      p.id === updatedPlayer.id ? updatedPlayer : p
    );
    PlayerManagementUtils.savePlayers(updatedPlayers);
    setPlayers(updatedPlayers);
  };

  const handleDeletePlayer = (playerId) => {
    if (window.confirm('Are you sure you want to delete this player?')) {
      const updatedPlayers = players.filter(p => p.id !== playerId);
      PlayerManagementUtils.savePlayers(updatedPlayers);
      setPlayers(updatedPlayers);
    }
  };

  const handleExportCSV = () => {
    PlayerManagementUtils.exportPlayersToCSV(players);
  };

  const handleImportCSV = (file) => {
    PlayerManagementUtils.importPlayersFromCSV(file, players, (importedCount, totalCount) => {
      alert(`Imported ${importedCount} new players. Total players: ${totalCount}`);
      loadPlayers();
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-800 text-white p-4 shadow-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-blue-200 hover:text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <h1 className="text-2xl font-bold">Player Management</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 mb-6">
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Add Player</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Export CSV</span>
            </button>

            <div className="relative">
              <input
                type="file"
                accept=".csv"
                onChange={(e) => e.target.files[0] && handleImportCSV(e.target.files[0])}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
                <span>Import CSV</span>
              </button>
            </div>
          </div>

          {/* Players Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Name</th>
                  <th className="border border-gray-300 px-4 py-2 text-left font-semibold">User ID</th>
                  <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Status</th>
                  <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Tournaments</th>
                  <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Total Points</th>
                  <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {players.map((player) => (
                  <tr key={player.id} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2">
                      {player.firstName} {player.surname}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">{player.userId}</td>
                    <td className="border border-gray-300 px-4 py-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${player.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                        }`}>
                        {player.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {player.totalTournaments || 0}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {player.totalPoints || 0}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setEditingPlayer(player);
                            setShowModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeletePlayer(player.id)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {players.length === 0 && (
              <div className="text-center py-8">
                <div className="text-gray-400 text-6xl mb-4">👥</div>
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No Players</h3>
                <p className="text-gray-500 mb-4">
                  Add players to get started
                </p>
                <button
                  onClick={() => setShowModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
                >
                  Add First Player
                </button>
              </div>
            )}
          </div>

          {/* Player Management Modal - FIXED PROPS */}
          <PlayerManagementModal
            isOpen={showModal}
            onClose={() => {
              setShowModal(false);
              setEditingPlayer(null);
            }}
            players={players}
            onAddPlayer={handleAddPlayer}
            onUpdatePlayer={handleUpdatePlayer}
            onDeletePlayer={handleDeletePlayer}
          />
        </div>
      </div>
    </div>
  );
};

// HomePage Component
const HomePage = ({ activeSection, setActiveSection }) => {

  const [lastUsed, setLastUsed] = useState(null);
  const [showGlobalSettings, setShowGlobalSettings] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportScope, setExportScope] = useState('championship'); // 'championship' or 'player'
  const [selectedChampionshipId, setSelectedChampionshipId] = useState('');
  const [selectedPlayerId, setSelectedPlayerId] = useState('');
  const [exportExcel, setExportExcel] = useState(true);
  const [exportPdf, setExportPdf] = useState(true);
  const [championships, setChampionships] = useState([]);
  const [players, setPlayers] = useState([]);
// Load championships and players for export
useEffect(() => {
  const loadedChampionships = JSON.parse(localStorage.getItem('padelChampionships') || '[]');
  const loadedPlayers = PlayerManagementUtils.loadPlayers(); // USE THE UTILITY!
  console.log('Loaded players:', loadedPlayers);
  console.log('First player:', loadedPlayers[0]);
  setChampionships(loadedChampionships);
  setPlayers(loadedPlayers);
}, []);
  
  // Load last used item on mount
  useEffect(() => {
    const storedLastUsed = localStorage.getItem('padelManagerLastUsed');
    if (storedLastUsed) {
      try {
        setLastUsed(JSON.parse(storedLastUsed));
      } catch (e) {
        console.error('Error parsing last used item:', e);
      }
    }
  }, []);

  const getLastUsedPath = () => {
    if (lastUsed?.type === 'championship') return '/championships';
    if (lastUsed?.type === 'tournament') return '/tournaments';
    if (lastUsed?.type === 'players') return '/players';
    return '/';
  };

  const getLastUsedIcon = () => {
    if (lastUsed?.type === 'championship') {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      );
    }
    if (lastUsed?.type === 'tournament') {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      );
    }
    if (lastUsed?.type === 'players') {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      );
    }
    return null;
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="text-center mb-12">
        <h2 className="text-5xl font-bold text-blue-900 mb-4">Padel Manager</h2>
        <p className="text-xl text-gray-600">Professional tournament and championship management</p>
      </div>

      {/* Last Used Hero Card */}
      {lastUsed && (
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">Continue Where You Left Off</h3>
          <Link
            to={getLastUsedPath()}
            className="block p-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl shadow-xl transform transition-all duration-200 hover:scale-105 hover:shadow-2xl home-card press-effect no-select"
            onClick={() => {
              if (navigator.vibrate) {
                navigator.vibrate(20);
              }
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-2xl font-bold mb-2">{lastUsed.name}</h4>
                <p className="text-blue-100 capitalize">
                  {lastUsed.type} • {new Date(lastUsed.timestamp).toLocaleDateString()}
                </p>
              </div>
              <div className="text-white">
                {getLastUsedIcon()}
              </div>
            </div>
          </Link>
        </div>
      )}
      {/* Settings Icon */}
      <div className="flex justify-end mb-6">
        <button
          onClick={() => setShowGlobalSettings(true)}
          className="p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 border-2 border-blue-200"
          aria-label="Global Settings"
        >
          <span className="text-2xl">⚙️</span>
        </button>
      </div>

      {/* Main Options */}
      <div className="grid md:grid-cols-3 gap-8 mb-12">
        {/* Championships Card */}
        <Link
          to="/championships"
          className={`block p-6 rounded-xl shadow-lg transform transition-all duration-200 home-card press-effect no-select ${activeSection === 'championships'
            ? 'bg-blue-700 text-white scale-105 shadow-xl'
            : 'bg-white text-blue-800 hover:scale-105 hover:shadow-xl'
            }`}
          onClick={() => {
            setActiveSection('championships');
            if (navigator.vibrate) {
              navigator.vibrate(20);
            }
          }}
        >
          <div className="text-center">
            <h3 className="text-4xl font-bold mb-4">Championships</h3>
            <div className="mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <p className={`text-lg ${activeSection === 'championships' ? 'text-blue-100' : 'text-gray-600'}`}>
              Manage ongoing championships with flexible scoring and player management
            </p>
          </div>
        </Link>

        {/* Tournaments Card */}
        <Link
          to="/tournaments"
          className={`block p-6 rounded-xl shadow-lg transform transition-all duration-200 home-card press-effect no-select ${activeSection === 'tournaments'
            ? 'bg-blue-700 text-white scale-105 shadow-xl'
            : 'bg-white text-blue-800 hover:scale-105 hover:shadow-xl'
            }`}
          onClick={() => {
            setActiveSection('tournaments');
            if (navigator.vibrate) {
              navigator.vibrate(20);
            }
          }}
        >
          <div className="text-center">
            <h3 className="text-4xl font-bold mb-4">Tournaments</h3>
            <div className="mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <p className={`text-lg ${activeSection === 'tournaments' ? 'text-blue-100' : 'text-gray-600'}`}>
              Create and manage one-off tournaments with automatic scheduling
            </p>
          </div>
        </Link>

        {/* Player Management Card */}
        <Link
          to="/players"
          className={`block p-6 rounded-xl shadow-lg transform transition-all duration-200 home-card press-effect no-select ${activeSection === 'players'
            ? 'bg-blue-700 text-white scale-105 shadow-xl'
            : 'bg-white text-blue-800 hover:scale-105 hover:shadow-xl'
            }`}
          onClick={() => {
            setActiveSection('players');
            if (navigator.vibrate) {
              navigator.vibrate(20);
            }
          }}
        >
          <div className="text-center">
            <h3 className="text-4xl font-bold mb-4">Players</h3>
            <div className="mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <p className={`text-lg ${activeSection === 'players' ? 'text-blue-100' : 'text-gray-600'}`}>
              Manage your player database with import/export capabilities
            </p>
          </div>
        </Link>
      </div>

      {/* Description Area */}
      <div className="mt-12 p-6 bg-white rounded-xl shadow-md">
        <h3 className="text-2xl font-bold text-blue-800 mb-4">
          {activeSection === 'championships' ? 'About Championships' :
            activeSection === 'tournaments' ? 'About Tournaments' : 'About Player Management'}
        </h3>

        {activeSection === 'championships' ? (
          <p className="text-gray-600 text-lg leading-relaxed">
            Championships are ongoing competitions where you can record matches over time.
            Perfect for club leagues, seasonal competitions, or extended competitions with flexible scheduling.
          </p>
        ) : activeSection === 'tournaments' ? (
          <p className="text-gray-600 text-lg leading-relaxed">
            Tournaments are structured, one-time events with automatic scheduling and bracket generation.
            Ideal for competition days, knockout tournaments, or round-robin formats.
          </p>
        ) : (
          <p className="text-gray-600 text-lg leading-relaxed">
            Manage your player database centrally. Add new players, edit existing ones, import from CSV files,
            and export your player data. All players added here are available in both Championships and Tournaments.
          </p>
        )}
        {/* Global Settings Modal */}
        {showGlobalSettings && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                <h2 className="text-3xl font-bold mb-6">⚙️ Global Settings</h2>

                {/* Export Data Section */}
                <div className="mb-6 p-6 bg-gray-50 rounded-xl">
                  <h3 className="text-xl font-bold mb-2">📊 Data Export</h3>
                  <p className="text-gray-600 mb-4">Export championship and player data to Excel or PDF</p>
                  <button
                    onClick={() => {
                      setShowExportModal(true);
                      setShowGlobalSettings(false);
                    }}
                    className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors"
                  >
                    Export Data...
                  </button>
                </div>

                {/* Close Button */}
                <button
                  onClick={() => setShowGlobalSettings(false)}
                  className="w-full mt-6 px-6 py-3 bg-gray-200 hover:bg-gray-300 font-bold rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Export Data Modal */}
        {showExportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                <h2 className="text-3xl font-bold mb-6">📊 Export Data</h2>

                {/* Export Scope Selection */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold mb-3">What do you want to export?</h3>

                  <div className="space-y-3">
                    {/* Championship Option */}
                    <label className="flex items-start p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                      style={{ borderColor: exportScope === 'championship' ? '#9333ea' : '#e5e7eb' }}>
                      <input
                        type="radio"
                        name="exportScope"
                        value="championship"
                        checked={exportScope === 'championship'}
                        onChange={(e) => setExportScope(e.target.value)}
                        className="mt-1 mr-3"
                      />
                      <div className="flex-1">
                        <div className="font-bold">Full Championship</div>
                        <div className="text-sm text-gray-600">Export all matches, standings, and player stats from a championship</div>

                        {exportScope === 'championship' && (
                          <select
                            value={selectedChampionshipId}
                            onChange={(e) => setSelectedChampionshipId(e.target.value)}
                            className="mt-3 w-full p-2 border rounded-lg"
                          >
                            <option value="">Select a championship...</option>
                            {championships.map(champ => (
                              <option key={champ.id} value={champ.id}>
                                {champ.name} ({champ.matches?.length || 0} matches)
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    </label>

                    {/* Player Option */}
                    <label className="flex items-start p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                      style={{ borderColor: exportScope === 'player' ? '#9333ea' : '#e5e7eb' }}>
                      <input
                        type="radio"
                        name="exportScope"
                        value="player"
                        checked={exportScope === 'player'}
                        onChange={(e) => setExportScope(e.target.value)}
                        className="mt-1 mr-3"
                      />
                      <div className="flex-1">
                        <div className="font-bold">Individual Player</div>
                        <div className="text-sm text-gray-600">Export a player's complete match history and statistics</div>

                        {exportScope === 'player' && (
                          <select
                            value={selectedPlayerId}
                            onChange={(e) => setSelectedPlayerId(e.target.value)}
                            className="mt-3 w-full p-2 border rounded-lg"
                          >
                            <option value="">Select a player...</option>
                            {players.map(player => (
                              <option key={player.id} value={player.id}>
                                {player.firstName} {player.surname}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    </label>
                  </div>
                </div>

                {/* Format Selection */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold mb-3">Export Format:</h3>
                  <div className="space-y-2">
                    <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={exportExcel}
                        onChange={(e) => setExportExcel(e.target.checked)}
                        className="mr-3"
                      />
                      <div>
                        <div className="font-bold">Excel (.xlsx)</div>
                        <div className="text-sm text-gray-600">Comprehensive data with multiple sheets for analysis</div>
                      </div>
                    </label>

                    <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={exportPdf}
                        onChange={(e) => setExportPdf(e.target.checked)}
                        className="mr-3"
                      />
                      <div>
                        <div className="font-bold">PDF (.pdf)</div>
                        <div className="text-sm text-gray-600">Nicely formatted report for sharing</div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Preview */}
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <div className="text-sm text-blue-800">
                    {exportScope === 'championship' && selectedChampionshipId && (
                      <>Preview: {championships.find(c => c.id === parseInt(selectedChampionshipId))?.matches?.length || 0} matches from {championships.find(c => c.id === parseInt(selectedChampionshipId))?.name}</>
                    )}
                    {exportScope === 'player' && selectedPlayerId && (
                      <>Preview: All matches for {players.find(p => p.id === selectedPlayerId)?.firstName} {players.find(p => p.id === selectedPlayerId)?.surname}</>
                    )}
                    {(!selectedChampionshipId && exportScope === 'championship') || (!selectedPlayerId && exportScope === 'player') ? (
                      <>Please select a {exportScope} to export</>
                    ) : null}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowExportModal(false);
                      setShowGlobalSettings(true);
                    }}
                    className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 font-bold rounded-lg transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => {
                      if (exportExcel) {
                        if (exportScope === 'championship') {
                          const championship = championships.find(c => c.id === parseInt(selectedChampionshipId));
                          if (championship) {
                            exportChampionshipToExcel(championship, players);
                          }
                        } else if (exportScope === 'player') {
                          exportPlayerToExcel(selectedPlayerId, championships, players);
                        }
                      }

                      if (exportPdf) {
                        alert('PDF export will be implemented in Stage 5');
                      }

                      // Close modal
                      setShowExportModal(false);
                    }}
                    disabled={
                      (!exportExcel && !exportPdf) ||
                      (exportScope === 'championship' && !selectedChampionshipId) ||
                      (exportScope === 'player' && !selectedPlayerId)
                    }
                    className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors"
                  >
                    Export ⬇
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Main App Component
function App() {
  const [activeSection, setActiveSection] = useState('championships');
  const [showGlobalSettings, setShowGlobalSettings] = useState(false);

  return (
    <RoleProvider>
      <div className="App min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-blue-800 text-white p-4 shadow-md">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold text-center">Padel Manager</h1>
          </div>
        </header>

        <div className="container mx-auto p-4">
          <Routes>
            <Route path="/" element={<HomePage activeSection={activeSection} setActiveSection={setActiveSection} />} />
            <Route path="/tournaments" element={<PadelTournamentApp saveLastUsed={saveLastUsedItem} />} />
            <Route path="/championships" element={<ChampionshipManagement saveLastUsed={saveLastUsedItem} />} />
            <Route path="/players" element={<PlayerManagementView saveLastUsed={saveLastUsedItem} />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </RoleProvider>
  );
}

export default App;