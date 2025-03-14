import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { v4 as uuidv4 } from 'uuid';

// Tournament Selector Component
const TournamentSelector = ({ tournaments, onCreateTournament, onLoadTournament, onDeleteTournament }) => {
  const [newTournamentName, setNewTournamentName] = useState('');
  
  return (
    <div className="bg-white rounded-xl shadow-lg p-8 max-w-3xl mx-auto mt-10">
      <h2 className="text-3xl font-bold text-center mb-8 text-blue-800">Padel Tournament Manager</h2>
      
      {/* Create new tournament */}
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
            onClick={() => {
              if (newTournamentName.trim()) {
                onCreateTournament(newTournamentName);
                setNewTournamentName(''); // Clear input after creating
              }
            }}
            disabled={!newTournamentName.trim()}
            className="px-6 py-2 text-lg font-bold bg-blue-600 text-white rounded-lg disabled:bg-gray-400"
          >
            Create
          </button>
        </div>
      </div>
      
      {/* Load existing tournament */}
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
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteTournament(tournament.id);
                  }}
                  className="p-1 text-red-600 hover:bg-red-100 rounded"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
const PadelTournamentApp = () => {
  // Player data
  const [players, setPlayers] = useState([
    { id: 1, name: 'Amo', score: 0 },
    { id: 2, name: 'James', score: 0 },
    { id: 3, name: 'Paul', score: 0 },
    { id: 4, name: 'Ian', score: 0 },
    { id: 5, name: 'David', score: 0 },
    { id: 6, name: 'Michael', score: 0 },
    { id: 7, name: 'Chris', score: 0 },
    { id: 8, name: 'Mariano', score: 0 },
    { id: 9, name: 'Alistair', score: 0 }
  ]);

  // Match schedule with doubles teams (Rounds 1-3)
  const [matches, setMatches] = useState([
    {
      round: 1,
      time: "11:15",
      court1: { 
        teamA: [1, 6], // Amo & Michael
        teamB: [2, 7], // James & Chris
        gamesA: null,
        gamesB: null,
        scoreA: null,
        scoreB: null
      },
      court2: { 
        teamA: [3, 8], // Paul & Mariano
        teamB: [4, 9], // Ian & Alistair
        gamesA: null,
        gamesB: null,
        scoreA: null,
        scoreB: null
      },
      notPlaying: 5 // David
    },
    {
      round: 2,
      time: "11:28",
      court1: { 
        teamA: [9, 2], // Alistair & James
        teamB: [5, 4], // David & Ian
        gamesA: null,
        gamesB: null,
        scoreA: null,
        scoreB: null
      },
      court2: { 
        teamA: [7, 6], // Chris & Michael
        teamB: [8, 1], // Mariano & Amo
        gamesA: null,
        gamesB: null,
        scoreA: null,
        scoreB: null
      },
      notPlaying: 3 // Paul
    },
    {
      round: 3,
      time: "11:41",
      court1: { 
        teamA: [1, 8], // Amo & Mariano
        teamB: [7, 9], // Chris & Alistair
        gamesA: null,
        gamesB: null,
        scoreA: null,
        scoreB: null
      },
      court2: { 
        teamA: [5, 3], // David & Paul
        teamB: [4, 2], // Ian & James
        gamesA: null,
        gamesB: null,
        scoreA: null,
        scoreB: null
      },
      notPlaying: 6 // Michael
    },
    {
      round: 4,
      time: "11:54",
      court1: { 
        teamA: [2, 3], // James & Paul
        teamB: [4, 6], // Ian & Michael
        gamesA: null,
        gamesB: null,
        scoreA: null,
        scoreB: null
      },
      court2: { 
        teamA: [5, 1], // David & Amo
        teamB: [9, 7], // Alistair & Chris
        gamesA: null,
        gamesB: null,
        scoreA: null,
        scoreB: null
      },
      notPlaying: 8 // Mariano
    },
    {
      round: 5,
      time: "12:07",
      court1: { 
        teamA: [5, 9], // David & Alistair
        teamB: [8, 7], // Mariano & Chris
        gamesA: null,
        gamesB: null,
        scoreA: null,
        scoreB: null
      },
      court2: { 
        teamA: [3, 2], // Paul & James
        teamB: [6, 4], // Michael & Ian
        gamesA: null,
        gamesB: null,
        scoreA: null,
        scoreB: null
      },
      notPlaying: 1 // Amo
    },
    {
      round: 6,
      time: "12:20",
      court1: { 
        teamA: [1, 5], // Amo & David
        teamB: [9, 3], // Alistair & Paul
        gamesA: null,
        gamesB: null,
        scoreA: null,
        scoreB: null
      },
      court2: { 
        teamA: [2, 8], // James & Mariano
        teamB: [6, 7], // Michael & Chris
        gamesA: null,
        gamesB: null,
        scoreA: null,
        scoreB: null
      },
      notPlaying: 4 // Ian
    },
    {
      round: 7,
      time: "12:33",
      court1: { 
        teamA: [9, 6], // Alistair & Michael
        teamB: [7, 5], // Chris & David
        gamesA: null,
        gamesB: null,
        scoreA: null,
        scoreB: null
      },
      court2: { 
        teamA: [3, 1], // Paul & Amo
        teamB: [8, 4], // Mariano & Ian
        gamesA: null,
        gamesB: null,
        scoreA: null,
        scoreB: null
      },
      notPlaying: 2 // James
    },
    {
      round: 8,
      time: "12:45",
      court1: { 
        teamA: [3, 9], // Paul & Alistair
        teamB: [4, 5], // Ian & David
        gamesA: null,
        gamesB: null,
        scoreA: null,
        scoreB: null
      },
      court2: { 
        teamA: [6, 8], // Michael & Mariano
        teamB: [1, 2], // Amo & James
        gamesA: null,
        gamesB: null,
        scoreA: null,
        scoreB: null
      },
      notPlaying: 7 // Chris
    },
    {
      round: 9,
      time: "12:58",
      court1: { 
        teamA: [8, 4], // Mariano & Ian
        teamB: [7, 2], // Chris & James
        gamesA: null,
        gamesB: null,
        scoreA: null,
        scoreB: null
      },
      court2: { 
        teamA: [6, 5], // Michael & David
        teamB: [1, 3], // Amo & Paul
        gamesA: null,
        gamesB: null,
        scoreA: null,
        scoreB: null
      },
      notPlaying: 9 // Alistair
    }
  ]);

  // Original States
  const [currentRound, setCurrentRound] = useState(1);
  const [viewMode, setViewMode] = useState('input'); // 'input', 'standings' or 'detailedStandings'
  const [inputMode, setInputMode] = useState('games'); // 'games' or 'points'
  const [headToHeadWinners, setHeadToHeadWinners] = useState([]);
  
  // New States for Persistence
  const [tournamentId, setTournamentId] = useState(null);
  const [tournamentName, setTournamentName] = useState('');
  const [savedTournaments, setSavedTournaments] = useState([]);
  const [showTournamentSelector, setShowTournamentSelector] = useState(true);
  const [exportDate, setExportDate] = useState(new Date().toLocaleDateString());
  const [tournamentComplete, setTournamentComplete] = useState(false);
  const [detailedStandingsData, setDetailedStandingsData] = useState([]);
  const [detailedCalculated, setDetailedCalculated] = useState(false);

  // Tennis scoring options
  const tennisScores = ["0", "15", "30", "40", "AD"];
  // Load saved tournaments from localStorage on initial render
  useEffect(() => {
    const savedData = localStorage.getItem('padelTournaments');
    if (savedData) {
      setSavedTournaments(JSON.parse(savedData));
    }
  }, []);

  // Save current tournament state to localStorage whenever it changes
  useEffect(() => {
    if (!tournamentId) return;
    
    // Only save if we're not in tournament selector mode
    if (!showTournamentSelector) {
      const currentTournament = {
        id: tournamentId,
        name: tournamentName,
        date: new Date().toLocaleString(),
        players,
        matches,
        currentRound
      };
      
      const updatedTournaments = [...savedTournaments.filter(t => t.id !== tournamentId), currentTournament];
      localStorage.setItem('padelTournaments', JSON.stringify(updatedTournaments));
      setSavedTournaments(updatedTournaments);
    }
  }, [players, matches, currentRound, tournamentId, tournamentName, savedTournaments, showTournamentSelector]);

  // Auto-calculate on load to ensure data is ready
  useEffect(() => {
    updatePlayerScores();
  }, []);

  // Check if tournament has finished at least 1 match in round 9
  useEffect(() => {
    const finalRound = matches[matches.length - 1];
    const hasCompletedMatches = 
      (finalRound.court1.gamesA !== null && finalRound.court1.gamesB !== null) ||
      (finalRound.court2.gamesA !== null && finalRound.court2.gamesB !== null);
    
    setTournamentComplete(hasCompletedMatches);
  }, [matches]);

  // Auto-calculate when viewing detailed standings
  useEffect(() => {
    if (viewMode === 'detailedStandings' && !detailedCalculated) {
      prepareDetailedStandings();
    }
  }, [viewMode, detailedCalculated]);

  // Update whenever matches change
  useEffect(() => {
    updatePlayerScores();
    setDetailedCalculated(false);
  }, [matches]);

  // Find player name by id
  const getPlayerName = (id) => {
    const player = players.find(p => p.id === id);
    return player ? player.name : '';
  };

  // Calculate tournament points
  const calculatePoints = (gamesA, gamesB, scoreA, scoreB) => {
    if (gamesA === null || gamesB === null) return [0, 0];
    
    const diff = gamesA - gamesB;
    
    if (diff > 1) {
      // Win by 2+ games
      return [3, 0];
    } else if (diff === 1) {
      // Win by 1 game
      return [2, 0];
    } else if (diff === 0) {
      // Games are tied, check points
      if (scoreA === null || scoreB === null) {
        return [0, 0];
      }
      
      const idxA = tennisScores.indexOf(scoreA);
      const idxB = tennisScores.indexOf(scoreB);
      
      if (idxA > idxB) {
        return [1, 0];
      } else if (idxB > idxA) {
        return [0, 1];
      } else {
        return [0, 0];
      }
    } else if (diff === -1) {
      // Loss by 1 game
      return [0, 2];
    } else {
      // Loss by 2+ games
      return [0, 3];
    }
  };
  // Build head-to-head records for all players
  const buildHeadToHeadRecords = () => {
    // Initialize head-to-head records matrix
    const h2hRecords = {};
    players.forEach(player => {
      h2hRecords[player.id] = {};
      players.forEach(opponent => {
        if (player.id !== opponent.id) {
          h2hRecords[player.id][opponent.id] = 0;
        }
      });
    });

    // Populate with match results
    matches.forEach(match => {
      // Check if results are available
      if (match.court1.gamesA !== null && match.court1.gamesB !== null) {
        const teamA = match.court1.teamA;
        const teamB = match.court1.teamB;
        const [pointsA, pointsB] = calculatePoints(
          match.court1.gamesA,
          match.court1.gamesB,
          match.court1.scoreA,
          match.court1.scoreB
        );

        // If team A has more points than team B
        if (pointsA > pointsB) {
          // Update head-to-head records
          teamA.forEach(playerA => {
            teamB.forEach(playerB => {
              h2hRecords[playerA][playerB] += 1;
            });
          });
        } 
        // If team B has more points than team A
        else if (pointsB > pointsA) {
          // Update head-to-head records
          teamB.forEach(playerB => {
            teamA.forEach(playerA => {
              h2hRecords[playerB][playerA] += 1;
            });
          });
        }
      }

      // Repeat for court 2
      if (match.court2.gamesA !== null && match.court2.gamesB !== null) {
        const teamA = match.court2.teamA;
        const teamB = match.court2.teamB;
        const [pointsA, pointsB] = calculatePoints(
          match.court2.gamesA,
          match.court2.gamesB,
          match.court2.scoreA,
          match.court2.scoreB
        );

        // If team A has more points than team B
        if (pointsA > pointsB) {
          // Update head-to-head records
          teamA.forEach(playerA => {
            teamB.forEach(playerB => {
              h2hRecords[playerA][playerB] += 1;
            });
          });
        } 
        // If team B has more points than team A
        else if (pointsB > pointsA) {
          // Update head-to-head records
          teamB.forEach(playerB => {
            teamA.forEach(playerA => {
              h2hRecords[playerB][playerA] += 1;
            });
          });
        }
      }
    });

    return h2hRecords;
  };

  // Pre-calculate detailed standings data
  const prepareDetailedStandings = () => {
    // First update player scores
    updatePlayerScores();
    
    // Sort players by standard criteria
    const sortedPlayers = [...players]
      .sort((a, b) => b.gameDifferential - a.gameDifferential)
      .sort((a, b) => {
        if (b.score === a.score && b.gameDifferential === a.gameDifferential) {
          return b.gamesWon - a.gamesWon;
        }
        return 0;
      })
      .sort((a, b) => b.score - a.score);
    
    // Find tie groups
    const tieGroups = [];
    let currentGroup = [sortedPlayers[0]];

    for (let i = 1; i < sortedPlayers.length; i++) {
      const current = sortedPlayers[i];
      const previous = sortedPlayers[i-1];
      
      if (current.score === previous.score && 
          current.gameDifferential === previous.gameDifferential &&
          current.gamesWon === previous.gamesWon) {
        // Add to current tie group
        currentGroup.push(current);
      } else {
        // If we had a tie group with more than one player, save it
        if (currentGroup.length > 1) {
          tieGroups.push([...currentGroup]);
        }
        // Start a new group
        currentGroup = [current];
      }
    }
    
    // Check the last group
    if (currentGroup.length > 1) {
      tieGroups.push(currentGroup);
    }

    // If we have tie groups, resolve with head-to-head
    const h2hWinners = [];
    const h2hRecords = buildHeadToHeadRecords();
    
    // Process each tie group
    if (tieGroups.length > 0) {
      tieGroups.forEach(group => {
        // Create mini-league of just these players
        const miniLeague = {};
        group.forEach(player => {
          miniLeague[player.id] = 0;
        });
        
        // Calculate head-to-head points
        group.forEach(player => {
          group.forEach(opponent => {
            if (player.id !== opponent.id) {
              miniLeague[player.id] += h2hRecords[player.id][opponent.id];
            }
          });
        });
        
        // Mark players who won head-to-head tiebreakers
        for (let i = 0; i < group.length; i++) {
          for (let j = 0; j < group.length; j++) {
            if (i !== j && miniLeague[group[i].id] > miniLeague[group[j].id]) {
              if (!h2hWinners.includes(group[i].id)) {
                h2hWinners.push(group[i].id);
              }
            }
          }
        }
      });
    }
    
    // Create standings data array with H2H info
    const standingsData = sortedPlayers.map(player => ({
      ...player,
      isInTieGroup: tieGroups.some(group => group.some(p => p.id === player.id)),
      isH2HWinner: h2hWinners.includes(player.id)
    }));
    
    setHeadToHeadWinners(h2hWinners);
    setDetailedStandingsData(standingsData);
    setDetailedCalculated(true);
  };
  // Update player scores and calculate game differentials
  const updatePlayerScores = () => {
    const newPlayers = [...players].map(p => ({ 
      ...p, 
      score: 0,
      gamesWon: 0,
      gamesLost: 0,
      gameDifferential: 0
    }));
    
    matches.forEach(match => {
      // Court 1
      const [pointsA1, pointsB1] = calculatePoints(
        match.court1.gamesA, 
        match.court1.gamesB, 
        match.court1.scoreA, 
        match.court1.scoreB
      );
      
      // Add points and games to players in Team A
      match.court1.teamA.forEach(playerId => {
        const playerIndex = newPlayers.findIndex(p => p.id === playerId);
        if (playerIndex !== -1 && match.court1.gamesA !== null) {
          newPlayers[playerIndex].score += pointsA1;
          newPlayers[playerIndex].gamesWon += match.court1.gamesA;
          if (match.court1.gamesB !== null) {
            newPlayers[playerIndex].gamesLost += match.court1.gamesB;
          }
        }
      });
      
      // Add points and games to players in Team B
      match.court1.teamB.forEach(playerId => {
        const playerIndex = newPlayers.findIndex(p => p.id === playerId);
        if (playerIndex !== -1 && match.court1.gamesB !== null) {
          newPlayers[playerIndex].score += pointsB1;
          newPlayers[playerIndex].gamesWon += match.court1.gamesB;
          if (match.court1.gamesA !== null) {
            newPlayers[playerIndex].gamesLost += match.court1.gamesA;
          }
        }
      });
      
      // Court 2
      const [pointsA2, pointsB2] = calculatePoints(
        match.court2.gamesA, 
        match.court2.gamesB, 
        match.court2.scoreA, 
        match.court2.scoreB
      );
      
      // Add points and games to players in Team A
      match.court2.teamA.forEach(playerId => {
        const playerIndex = newPlayers.findIndex(p => p.id === playerId);
        if (playerIndex !== -1 && match.court2.gamesA !== null) {
          newPlayers[playerIndex].score += pointsA2;
          newPlayers[playerIndex].gamesWon += match.court2.gamesA;
          if (match.court2.gamesB !== null) {
            newPlayers[playerIndex].gamesLost += match.court2.gamesB;
          }
        }
      });
      
      // Add points and games to players in Team B
      match.court2.teamB.forEach(playerId => {
        const playerIndex = newPlayers.findIndex(p => p.id === playerId);
        if (playerIndex !== -1 && match.court2.gamesB !== null) {
          newPlayers[playerIndex].score += pointsB2;
          newPlayers[playerIndex].gamesWon += match.court2.gamesB;
          if (match.court2.gamesA !== null) {
            newPlayers[playerIndex].gamesLost += match.court2.gamesA;
          }
        }
      });
    });
    
    // Calculate game differential
    newPlayers.forEach(player => {
      player.gameDifferential = player.gamesWon - player.gamesLost;
    });
    
    setPlayers(newPlayers);
  };
  
  // Current match data
  const currentMatch = matches[currentRound - 1];

  // Function to create a new tournament
  const createNewTournament = (name) => {
    const newId = uuidv4();
    setTournamentId(newId);
    setTournamentName(name);
    
    // Reset to default values
    setPlayers([
      { id: 1, name: 'Amo', score: 0 },
      { id: 2, name: 'James', score: 0 },
      { id: 3, name: 'Paul', score: 0 },
      { id: 4, name: 'Ian', score: 0 },
      { id: 5, name: 'David', score: 0 },
      { id: 6, name: 'Michael', score: 0 },
      { id: 7, name: 'Chris', score: 0 },
      { id: 8, name: 'Mariano', score: 0 },
      { id: 9, name: 'Alistair', score: 0 }
    ]);
    
    // Reset all scores in matches
    setMatches([
      {
        round: 1,
        time: "11:15",
        court1: { 
          teamA: [1, 6], 
          teamB: [2, 7], 
          gamesA: null,
          gamesB: null,
          scoreA: null,
          scoreB: null
        },
        court2: { 
          teamA: [3, 8], 
          teamB: [4, 9], 
          gamesA: null,
          gamesB: null,
          scoreA: null,
          scoreB: null
        },
        notPlaying: 5
      },
      {
        round: 2,
        time: "11:28",
        court1: { 
          teamA: [9, 2], 
          teamB: [5, 4], 
          gamesA: null,
          gamesB: null,
          scoreA: null,
          scoreB: null
        },
        court2: { 
          teamA: [7, 6], 
          teamB: [8, 1], 
          gamesA: null,
          gamesB: null,
          scoreA: null,
          scoreB: null
        },
        notPlaying: 3
      },
      {
        round: 3,
        time: "11:41",
        court1: { 
          teamA: [1, 8], 
          teamB: [7, 9], 
          gamesA: null,
          gamesB: null,
          scoreA: null,
          scoreB: null
        },
        court2: { 
          teamA: [5, 3], 
          teamB: [4, 2], 
          gamesA: null,
          gamesB: null,
          scoreA: null,
          scoreB: null
        },
        notPlaying: 6
      },
      {
        round: 4,
        time: "11:54",
        court1: { 
          teamA: [2, 3], 
          teamB: [4, 6], 
          gamesA: null,
          gamesB: null,
          scoreA: null,
          scoreB: null
        },
        court2: { 
          teamA: [5, 1], 
          teamB: [9, 7], 
          gamesA: null,
          gamesB: null,
          scoreA: null,
          scoreB: null
        },
        notPlaying: 8
      },
      {
        round: 5,
        time: "12:07",
        court1: { 
          teamA: [5, 9], 
          teamB: [8, 7], 
          gamesA: null,
          gamesB: null,
          scoreA: null,
          scoreB: null
        },
        court2: { 
          teamA: [3, 2], 
          teamB: [6, 4], 
          gamesA: null,
          gamesB: null,
          scoreA: null,
          scoreB: null
        },
        notPlaying: 1
      },
      {
        round: 6,
        time: "12:20",
        court1: { 
          teamA: [1, 5], 
          teamB: [9, 3], 
          gamesA: null,
          gamesB: null,
          scoreA: null,
          scoreB: null
        },
        court2: { 
          teamA: [2, 8], 
          teamB: [6, 7], 
          gamesA: null,
          gamesB: null,
          scoreA: null,
          scoreB: null
        },
        notPlaying: 4
      },
      {
        round: 7,
        time: "12:33",
        court1: { 
          teamA: [9, 6], 
          teamB: [7, 5], 
          gamesA: null,
          gamesB: null,
          scoreA: null,
          scoreB: null
        },
        court2: { 
          teamA: [3, 1], 
          teamB: [8, 4], 
          gamesA: null,
          gamesB: null,
          scoreA: null,
          scoreB: null
        },
        notPlaying: 2
      },
      {
        round: 8,
        time: "12:45",
        court1: { 
          teamA: [3, 9], 
          teamB: [4, 5], 
          gamesA: null,
          gamesB: null,
          scoreA: null,
          scoreB: null
        },
        court2: { 
          teamA: [6, 8], 
          teamB: [1, 2], 
          gamesA: null,
          gamesB: null,
          scoreA: null,
          scoreB: null
        },
        notPlaying: 7
      },
      {
        round: 9,
        time: "12:58",
        court1: { 
          teamA: [8, 4], 
          teamB: [7, 2], 
          gamesA: null,
          gamesB: null,
          scoreA: null,
          scoreB: null
        },
        court2: { 
          teamA: [6, 5], 
          teamB: [1, 3], 
          gamesA: null,
          gamesB: null,
          scoreA: null,
          scoreB: null
        },
        notPlaying: 9
      }
    ]);
    
    setCurrentRound(1);
    setViewMode('input');
    setShowTournamentSelector(false);
  };
  
  // Function to load an existing tournament
  const loadTournament = (tournament) => {
    setTournamentId(tournament.id);
    setTournamentName(tournament.name);
    setPlayers(tournament.players);
    setMatches(tournament.matches);
    setCurrentRound(tournament.currentRound || 1);
    setViewMode('input');
    setShowTournamentSelector(false);
  };
  
  // Function to delete a tournament
  const deleteTournament = (id) => {
    const updatedTournaments = savedTournaments.filter(t => t.id !== id);
    localStorage.setItem('padelTournaments', JSON.stringify(updatedTournaments));
    setSavedTournaments(updatedTournaments);
  };
  
  // Function to go back to tournament selection
  const backToTournamentSelector = () => {
    setShowTournamentSelector(true);
  };
  // Update games
  const updateGames = (court, team, games) => {
    setMatches(prevMatches => {
      const newMatches = [...prevMatches];
      const match = { ...newMatches[currentRound - 1] };
      
      if (court === 1) {
        if (team === 'A') {
          match.court1 = { ...match.court1, gamesA: games };
        } else {
          match.court1 = { ...match.court1, gamesB: games };
        }
      } else {
        if (team === 'A') {
          match.court2 = { ...match.court2, gamesA: games };
        } else {
          match.court2 = { ...match.court2, gamesB: games };
        }
      }
      
      newMatches[currentRound - 1] = match;
      return newMatches;
    });
  };

  // Update tennis score
  const updateScore = (court, team, score) => {
    setMatches(prevMatches => {
      const newMatches = [...prevMatches];
      const match = { ...newMatches[currentRound - 1] };
      
      if (court === 1) {
        if (team === 'A') {
          match.court1 = { ...match.court1, scoreA: score };
        } else {
          match.court1 = { ...match.court1, scoreB: score };
        }
      } else {
        if (team === 'A') {
          match.court2 = { ...match.court2, scoreA: score };
        } else {
          match.court2 = { ...match.court2, scoreB: score };
        }
      }
      
      newMatches[currentRound - 1] = match;
      return newMatches;
    });
  };

  // Navigate rounds
  const prevRound = () => {
    setCurrentRound(prev => Math.max(1, prev - 1));
  };

  const nextRound = () => {
    setCurrentRound(prev => Math.min(matches.length, prev + 1));
  };

  // Get team names
  const getTeamName = (court, team) => {
    if (!currentMatch) return '';
    
    const players = 
      court === 1 
        ? (team === 'A' ? currentMatch.court1.teamA : currentMatch.court1.teamB)
        : (team === 'A' ? currentMatch.court2.teamA : currentMatch.court2.teamB);
    
    return players.map(id => getPlayerName(id)).join(' & ');
  };

  // Get games
  const getGames = (court, team) => {
    if (!currentMatch) return '-';
    
    const games = 
      court === 1 
        ? (team === 'A' ? currentMatch.court1.gamesA : currentMatch.court1.gamesB)
        : (team === 'A' ? currentMatch.court2.gamesA : currentMatch.court2.gamesB);
    
    return games !== null ? games : '-';
  };

  // Get score
  const getScore = (court, team) => {
    if (!currentMatch) return '-';
    
    const score = 
      court === 1 
        ? (team === 'A' ? currentMatch.court1.scoreA : currentMatch.court1.scoreB)
        : (team === 'A' ? currentMatch.court2.scoreA : currentMatch.court2.scoreB);
    
    return score !== null ? score : '-';
  };

  // Get tournament points
  const getTournamentPoints = (court, team) => {
    if (!currentMatch) return 0;
    
    if (court === 1) {
      const [pointsA, pointsB] = calculatePoints(
        currentMatch.court1.gamesA,
        currentMatch.court1.gamesB,
        currentMatch.court1.scoreA,
        currentMatch.court1.scoreB
      );
      return team === 'A' ? pointsA : pointsB;
    } else {
      const [pointsA, pointsB] = calculatePoints(
        currentMatch.court2.gamesA,
        currentMatch.court2.gamesB,
        currentMatch.court2.scoreA,
        currentMatch.court2.scoreB
      );
      return team === 'A' ? pointsA : pointsB;
    }
  };
  // Export data to Excel
const exportToExcel = () => {
  try {
    // Create workbook
    const workbook = XLSX.utils.book_new();
    
    // Sheet 1: Overall Standings
    const standingsData = [...players]
      .sort((a, b) => b.score - a.score)
      .map((player, index) => ({
        Position: index + 1,
        Player: player.name,
        Points: player.score
      }));
    
    const standingsSheet = XLSX.utils.json_to_sheet(standingsData);
    XLSX.utils.book_append_sheet(workbook, standingsSheet, "Standings");
    
    // Sheet 2: Detailed Standings
    if (!detailedCalculated) {
      prepareDetailedStandings();
    }

    const detailedData = detailedStandingsData.map((player, index) => {
      return {
        Position: index + 1,
        Player: player.name,
        Points: player.score,
        "Games Won": player.gamesWon,
        "Games Lost": player.gamesLost,
        Differential: player.gameDifferential,
        "H2H Winner": player.isH2HWinner ? "Yes" : "",
        "In Tie Group": player.isInTieGroup ? "Yes" : ""
      };
    });

    const detailedSheet = XLSX.utils.json_to_sheet(detailedData);
    XLSX.utils.book_append_sheet(workbook, detailedSheet, "Detailed Standings");
    
    // ... rest of the function ...
  } catch (error) {
    console.error("Error exporting to Excel:", error);
    alert("There was an error exporting to Excel. Make sure the XLSX library is properly loaded.");
  }
};

  // Tournament navbar
  const renderTournamentNavbar = () => {
    return (
      <div className="bg-blue-800 text-white p-4 flex justify-between items-center mb-6 rounded-lg shadow-md">
        <div className="flex items-center">
          <button 
            onClick={backToTournamentSelector}
            className="mr-4 p-2 hover:bg-blue-700 rounded transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h3 className="text-2xl font-bold truncate">
            {tournamentName || 'Tournament'}
          </h3>
        </div>
        <div className="text-sm opacity-75">
          Auto-saving
        </div>
      </div>
    );
  };
  // Complete component return
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Tournament Selector Mode */}
      {showTournamentSelector ? (
        <TournamentSelector 
          tournaments={savedTournaments}
          onCreateTournament={createNewTournament}
          onLoadTournament={loadTournament}
          onDeleteTournament={deleteTournament}
        />
      ) : (
        <div className="max-w-4xl mx-auto">
          {/* Tournament Navigation Bar */}
          {renderTournamentNavbar()}
          
          {/* Header */}
          <header className="mb-8">
            <h1 className="text-5xl font-bold text-center text-blue-800 mb-6">Padel Tournament</h1>
            <div className="flex justify-center mt-6">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <button
                  className={`px-8 py-4 text-2x1 font-bold ${
                    viewMode === 'input' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setViewMode('input')}
                >
                  Input Scores
                </button>
                <button
                  className={`px-8 py-4 font-bold ${
                    viewMode === 'standings' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setViewMode('standings')}
                >
                  Standings
                </button>
                <button
                  className={`px-8 py-4 text-2xl font-bold ${
                    viewMode === 'detailedStandings' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => {
                    setViewMode('detailedStandings');
                    if (!detailedCalculated) {
                      prepareDetailedStandings();
                    }
                  }}
                >
                  Detailed
                </button>
              </div>
            </div>
            
            {/* Export Button - Only Show After Tournament Completion */}
            {tournamentComplete && (
              <div className="mt-4 flex justify-center">
                <button
                  className="px-6 py-2 font-bold bg-green-600 text-white rounded-lg shadow flex items-center hover:bg-green-700"
                  onClick={exportToExcel}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Export Final Results
                </button>
              </div>
            )}
          </header>
          {/* Score Input View */}
          {viewMode === 'input' && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              {/* Round Navigation */}
              <div className="flex justify-between items-center mb-6">
                <button
                  className="px-6 py-3 text-2xl font-bold bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-50 disabled:opacity-50 transition-colors flex items-center"
                  onClick={prevRound}
                  disabled={currentRound === 1}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Prev
                </button>
                <h2 className="text-3xl font-bold">
                  Round {currentRound}
                  <span className="ml-3 text-2xl text-blue-600 font-semibold">({currentMatch.time})</span>
                </h2>
                <button
                  className="px-6 py-3 text-2xl font-bold bg-blue-100 text-blue-800 rounded-xl hover:bg-blue-200 disabled:opacity-50 transition-colors flex items-center"
                  onClick={nextRound}
                  disabled={currentRound === matches.length}
                >
                  Next
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Input Mode Toggle */}
              <div className="flex justify-center mb-4">
                <div className="bg-gray-100 p-1 rounded-lg inline-flex">
                  <button
                    className={`px-4 py-2 rounded-md text-sm font-medium ${
                      inputMode === 'games' 
                        ? 'bg-white shadow text-blue-800' 
                        : 'text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => setInputMode('games')}
                  >
                    Games Won
                  </button>
                  <button
                    className={`px-4 py-2 rounded-md text-sm font-medium ${
                      inputMode === 'points' 
                        ? 'bg-white shadow text-blue-800' 
                        : 'text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => setInputMode('points')}
                  >
                    Current Point
                  </button>
                </div>
              </div>

              {/* Not Playing */}
              <div className="text-center mb-6 p-4 bg-amber-50 rounded-xl border-2 border-amber-200 shadow-sm">
                <p className="text-2xl">
                  <span className="font-bold">Not Playing:</span>{' '}
                  <span className="text-amber-800 font-bold text-2xl">{getPlayerName(currentMatch.notPlaying)}</span>
                </p>
              </div>

              {/* Court 1 */}
              <div className="bg-blue-600 text-white py-3 px-4 text-center font-bold text-2xl rounded-t-lg">
                <div className="bg-blue-600 text-white py-2 px-4 text-center font-bold">
                  Court 5
                </div>
                
                {/* Team A */}
                <div className="p-5">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <div className="text-2x1 font-bold text-lg">
                        {getTeamName(1, 'A')}
                      </div>
                      <div className="text-xl mt-1">
                        Games: <span className="font-semibold">{getGames(1, 'A')}</span>
                        {getScore(1, 'A') !== '-' && 
                          <span className="ml-2">
                            Current: <span className="font-semibold">{getScore(1, 'A')}</span>
                          </span>
                        }
                      </div>
                    </div>
                    <div className="px-5 py-2 bg-blue-100 text-blue-800 text-2xl font-bold rounded-xl border border-blue-200 shadow-sm">
                      {getTournamentPoints(1, 'A')} pts
                    </div>
                  </div>
                  
                  {/* Score Input Buttons */}
                  <div className="mt-2">
                    {inputMode === 'games' ? (
                      <div className="grid grid-cols-4 gap-3 mt-4">
                        {[0, 1, 2, 3, 4, 5, 6].map((value) => (
                          <button
                            key={value}
                            className={`py-4 text-2xl rounded-xl font-bold ${
                              currentMatch.court1.gamesA === value
                                ? 'bg-blue-500 text-white shadow-md'
                                : 'bg-white text-gray-800 hover:bg-gray-100 border-2 border-gray-200 hover:border-blue-300'
                            }`}
                            onClick={() => updateGames(1, 'A', value)}
                          >
                            {value}
                          </button>
                        ))}
                        <button
                          className="py-4 text-xl text-red-600 bg-white hover:bg-red-50 border-2 border-red-200 rounded-xl font-semibold"
                          onClick={() => updateGames(1, 'A', null)}
                        >
                          Clear
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-3 mt-4">
                        {tennisScores.map((value) => (
                          <button
                            key={value}
                            className={`py-4 text-2xl rounded-xl font-bold ${
                              currentMatch.court1.scoreA === value
                                ? 'bg-green-500 text-white shadow-md'
                                : 'bg-white text-gray-800 hover:bg-gray-100 border-2 border-gray-200 hover:border-green-300'
                            }`}
                            onClick={() => updateScore(1, 'A', value)}
                          >
                            {value}
                          </button>
                        ))}
                        <button
                          className="py-4 text-xl text-red-600 bg-white hover:bg-red-50 border-2 border-red-200 rounded-xl font-semibold"
                          onClick={() => updateScore(1, 'A', null)}
                        >
                          Clear
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="border-t border-blue-200"></div>
                
                {/* Team B */}
                <div className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <div className="font-bold text-lg">
                        {getTeamName(1, 'B')}
                      </div>
                      <div className="text-sm">
                        Games: <span className="font-semibold">{getGames(1, 'B')}</span>
                        {getScore(1, 'B') !== '-' && 
                          <span className="ml-2">
                            Current: <span className="font-semibold">{getScore(1, 'B')}</span>
                          </span>
                        }
                      </div>
                    </div>
                    <div className="px-3 py-1 bg-blue-100 text-blue-800 font-bold rounded border border-blue-200">
                      {getTournamentPoints(1, 'B')} pts
                    </div>
                  </div>
                  
                  {/* Score Input Buttons */}
                  <div className="mt-2">
                    {inputMode === 'games' ? (
                      <div className="grid grid-cols-4 gap-2">
                        {[0, 1, 2, 3, 4, 5, 6].map((value) => (
                          <button
                            key={value}
                            className={`py-2 rounded font-bold ${
                              currentMatch.court1.gamesB === value
                                ? 'bg-blue-500 text-white'
                                : 'bg-white text-gray-800 hover:bg-gray-100 border border-gray-200'
                            }`}
                            onClick={() => updateGames(1, 'B', value)}
                          >
                            {value}
                          </button>
                        ))}
                        <button
                          className="py-2 text-sm text-red-600 bg-white hover:bg-red-50 border border-red-200 rounded"
                          onClick={() => updateGames(1, 'B', null)}
                        >
                          Clear
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-2">
                        {tennisScores.map((value) => (
                          <button
                            key={value}
                            className={`py-2 rounded font-bold ${
                              currentMatch.court1.scoreB === value
                                ? 'bg-green-500 text-white'
                                : 'bg-white text-gray-800 hover:bg-gray-100 border border-gray-200'
                            }`}
                            onClick={() => updateScore(1, 'B', value)}
                          >
                            {value}
                          </button>
                        ))}
                        <button
                          className="py-2 text-sm text-red-600 bg-white hover:bg-red-50 border border-red-200 rounded"
                          onClick={() => updateScore(1, 'B', null)}
                        >
                          Clear
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {/* Court 2 */}
              <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200 overflow-hidden">
                <div className="bg-green-600 text-white py-2 px-4 text-center font-bold">
                  Court 6
                </div>
                
                {/* Team A */}
                <div className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <div className="font-bold text-lg">
                        {getTeamName(2, 'A')}
                      </div>
                      <div className="text-sm">
                        Games: <span className="font-semibold">{getGames(2, 'A')}</span>
                        {getScore(2, 'A') !== '-' && 
                          <span className="ml-2">
                            Current: <span className="font-semibold">{getScore(2, 'A')}</span>
                          </span>
                        }
                      </div>
                    </div>
                    <div className="px-3 py-1 bg-green-100 text-green-800 font-bold rounded border border-green-200">
                      {getTournamentPoints(2, 'A')} pts
                    </div>
                  </div>
                  
                  {/* Score Input Buttons */}
                  <div className="mt-2">
                    {inputMode === 'games' ? (
                      <div className="grid grid-cols-4 gap-2">
                        {[0, 1, 2, 3, 4, 5, 6].map((value) => (
                          <button
                            key={value}
                            className={`py-2 rounded font-bold ${
                              currentMatch.court2.gamesA === value
                                ? 'bg-green-500 text-white'
                                : 'bg-white text-gray-800 hover:bg-gray-100 border border-gray-200'
                            }`}
                            onClick={() => updateGames(2, 'A', value)}
                          >
                            {value}
                          </button>
                        ))}
                        <button
                          className="py-2 text-sm text-red-600 bg-white hover:bg-red-50 border border-red-200 rounded"
                          onClick={() => updateGames(2, 'A', null)}
                        >
                          Clear
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-2">
                        {tennisScores.map((value) => (
                          <button
                            key={value}
                            className={`py-2 rounded font-bold ${
                              currentMatch.court2.scoreA === value
                                ? 'bg-green-500 text-white'
                                : 'bg-white text-gray-800 hover:bg-gray-100 border border-gray-200'
                            }`}
                            onClick={() => updateScore(2, 'A', value)}
                          >
                            {value}
                          </button>
                        ))}
                        <button
                          className="py-2 text-sm text-red-600 bg-white hover:bg-red-50 border border-red-200 rounded"
                          onClick={() => updateScore(2, 'A', null)}
                        >
                          Clear
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="border-t border-green-200"></div>
                
                {/* Team B */}
                <div className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <div className="font-bold text-lg">
                        {getTeamName(2, 'B')}
                      </div>
                      <div className="text-sm">
                        Games: <span className="font-semibold">{getGames(2, 'B')}</span>
                        {getScore(2, 'B') !== '-' && 
                          <span className="ml-2">
                            Current: <span className="font-semibold">{getScore(2, 'B')}</span>
                          </span>
                        }
                      </div>
                    </div>
                    <div className="px-3 py-1 bg-green-100 text-green-800 font-bold rounded border border-green-200">
                      {getTournamentPoints(2, 'B')} pts
                    </div>
                  </div>
                  
                  {/* Score Input Buttons */}
                  <div className="mt-2">
                    {inputMode === 'games' ? (
                      <div className="grid grid-cols-4 gap-2">
                        {[0, 1, 2, 3, 4, 5, 6].map((value) => (
                          <button
                            key={value}
                            className={`py-2 rounded font-bold ${
                              currentMatch.court2.gamesB === value
                                ? 'bg-green-500 text-white'
                                : 'bg-white text-gray-800 hover:bg-gray-100 border border-gray-200'
                            }`}
                            onClick={() => updateGames(2, 'B', value)}
                          >
                            {value}
                          </button>
                        ))}
                        <button
                          className="py-2 text-sm text-red-600 bg-white hover:bg-red-50 border border-red-200 rounded"
                          onClick={() => updateGames(2, 'B', null)}
                        >
                          Clear
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-2">
                        {tennisScores.map((value) => (
                          <button
                            key={value}
                            className={`py-2 rounded font-bold ${
                              currentMatch.court2.scoreB === value
                                ? 'bg-green-500 text-white'
                                : 'bg-white text-gray-800 hover:bg-gray-100 border border-gray-200'
                            }`}
                            onClick={() => updateScore(2, 'B', value)}
                          >
                            {value}
                          </button>
                        ))}
                        <button
                          className="py-2 text-sm text-red-600 bg-white hover:bg-red-50 border border-red-200 rounded"
                          onClick={() => updateScore(2, 'B', null)}
                        >
                          Clear
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Standings View */}
          {viewMode === 'standings' && (
            <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-center mb-6 text-blue-800">Tournament Standings</h2>
            
            <div className="overflow-hidden rounded-xl border-2 border-gray-200 shadow-sm">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-blue-50">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-center text-lg font-semibold text-blue-800 uppercase tracking-wider">
                      Pos
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-lg font-semibold text-blue-800 uppercase tracking-wider">
                      Player
                    </th>
                    <th scope="col" className="px-6 py-4 text-right text-lg font-semibold text-blue-800 uppercase tracking-wider">
                      Points
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {[...players].sort((a, b) => b.score - a.score).map((player, index) => (
                    <tr 
                      key={player.id} 
                      className={index === 0 ? 'bg-yellow-100' : (index % 2 === 0 ? 'bg-white' : 'bg-gray-50')}
                    >
                      <td className="px-6 py-5 whitespace-nowrap text-center">
                        <div className="text-2xl font-bold text-blue-800">{index + 1}</div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="text-2xl font-medium">{player.name}</div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-right">
                        <div className="text-3xl font-bold text-blue-800">{player.score}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          )}
          
     {/* Detailed Standings View */}
{viewMode === 'detailedStandings' && (
  <div className="bg-white rounded-lg shadow-md p-6">
    <h2 className="text-xl font-bold text-center mb-4 text-blue-800">Detailed Standings</h2>
    
    <div className="overflow-x-auto rounded-xl border-2 border-gray-200 shadow-sm">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-blue-100">
          <tr>
            <th className="px-5 py-4 text-center text-lg font-semibold text-blue-800 uppercase">Pos</th>
            <th className="px-5 py-4 text-left text-lg font-semibold text-blue-800 uppercase">Player</th>
            <th className="px-5 py-4 text-center text-lg font-semibold text-blue-800 uppercase">Points</th>
            <th className="px-5 py-4 text-center text-lg font-semibold text-blue-800 uppercase">Games Won</th>
            <th className="px-5 py-4 text-center text-lg font-semibold text-blue-800 uppercase">Games Lost</th>
            <th className="px-5 py-4 text-center text-lg font-semibold text-blue-800 uppercase">Diff</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {detailedStandingsData.map((player, index) => {
            // Determine row class based on position and head-to-head result
            let rowClass = ``;
            if (index === 0) rowClass = 'bg-yellow-100';
            else if (player.isH2HWinner) rowClass = 'bg-green-100';
            else if (player.isInTieGroup && !player.isH2HWinner) rowClass = 'bg-blue-50';
            else rowClass = index % 2 === 0 ? 'bg-white' : 'bg-gray-50';
            
            return (
              <tr 
                key={player.id} 
                className={rowClass}
              >
                <td className="px-5 py-4 text-center text-xl font-bold">{index + 1}</td>
                <td className="px-5 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className="text-xl font-medium">{player.name}</span>
                    {player.isH2HWinner && (
                      <span className="ml-3 inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-green-200 text-green-800">
                        H2H
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-5 py-4 text-center text-2xl font-bold">{player.score}</td>
                <td className="px-5 py-4 text-center text-xl">{player.gamesWon}</td>
                <td className="px-5 py-4 text-center text-xl">{player.gamesLost}</td>
                <td className="px-5 py-4 text-center text-xl font-medium">
                  <span className={player.gameDifferential > 0 ? 'text-green-600' : (player.gameDifferential < 0 ? 'text-red-600' : '')}>
                    {player.gameDifferential > 0 ? '+' : ''}{player.gameDifferential}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
    
    {/* Legend */}
    <div className="mt-4 flex flex-wrap gap-2 text-xs">
      <div className="flex items-center">
        <div className="w-4 h-4 bg-yellow-50 border border-yellow-200 mr-1"></div>
        <span>Tournament leader</span>
      </div>
      <div className="flex items-center">
        <div className="w-4 h-4 bg-green-50 border border-green-200 mr-1"></div>
        <span>H2H winner</span>
      </div>
      <div className="flex items-center">
        <div className="w-4 h-4 bg-blue-50 border border-blue-200 mr-1"></div>
        <span>In tie group</span>
      </div>
    </div>
  </div>

              
export default PadelTournamentApp;