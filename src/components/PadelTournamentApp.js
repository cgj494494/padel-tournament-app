import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

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

  // Match schedule with doubles teams
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

  // States
  const [currentRound, setCurrentRound] = useState(1);
  const [viewMode, setViewMode] = useState('input'); // 'input', 'standings' or 'detailedStandings'
  const [inputMode, setInputMode] = useState('games'); // 'games' or 'points'
  const [headToHeadWinners, setHeadToHeadWinners] = useState([]); // Track players positioned by H2H
  const [exportDate, setExportDate] = useState(new Date().toLocaleDateString()); // Date for export filename

  // Tennis scoring options
  const tennisScores = ["0", "15", "30", "40", "AD"];

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

  // Sort players with head-to-head tiebreaker
  const sortPlayersWithHeadToHead = () => {
    // First sort by basic criteria
    const sortedPlayers = [...players]
      // First sort by game differential in case of tie
      .sort((a, b) => b.gameDifferential - a.gameDifferential)
      // Then sort by games won in case of tie on points and differential
      .sort((a, b) => {
        if (b.score === a.score && b.gameDifferential === a.gameDifferential) {
          return b.gamesWon - a.gamesWon;
        }
        return 0;
      })
      // Then sort by score (tournament points)
      .sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score;
        }
        // If scores are tied, use the game differential (already sorted)
        return 0;
      });

    // Find groups of players with identical scores, differentials, and games won
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
    
    if (tieGroups.length > 0) {
      const h2hRecords = buildHeadToHeadRecords();
      
      // For each tie group
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
        
        // Sort the group by head-to-head results
        group.sort((a, b) => miniLeague[b.id] - miniLeague[a.id]);
        
        // Mark players who won head-to-head tiebreakers
        for (let i = 0; i < group.length - 1; i++) {
          if (miniLeague[group[i].id] > miniLeague[group[i+1].id]) {
            h2hWinners.push(group[i].id);
          }
        }
      });
    }
    
    setHeadToHeadWinners(h2hWinners);
    return sortedPlayers;
  };

  // Update whenever matches change
  useEffect(() => {
    updatePlayerScores();
  }, [matches]);

  // Current match data
  const currentMatch = matches[currentRound - 1];

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
    const players = 
      court === 1 
        ? (team === 'A' ? currentMatch.court1.teamA : currentMatch.court1.teamB)
        : (team === 'A' ? currentMatch.court2.teamA : currentMatch.court2.teamB);
    
    return players.map(id => getPlayerName(id)).join(' & ');
  };

  // Get games
  const getGames = (court, team) => {
    const games = 
      court === 1 
        ? (team === 'A' ? currentMatch.court1.gamesA : currentMatch.court1.gamesB)
        : (team === 'A' ? currentMatch.court2.gamesA : currentMatch.court2.gamesB);
    
    return games !== null ? games : '-';
  };

  // Get score
  const getScore = (court, team) => {
    const score = 
      court === 1 
        ? (team === 'A' ? currentMatch.court1.scoreA : currentMatch.court1.scoreB)
        : (team === 'A' ? currentMatch.court2.scoreA : currentMatch.court2.scoreB);
    
    return score !== null ? score : '-';
  };

  // Get tournament points
  const getTournamentPoints = (court, team) => {
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
    const sortedPlayers = sortPlayersWithHeadToHead();
    const detailedData = sortedPlayers.map((player, index) => {
      const wonByH2H = headToHeadWinners.includes(player.id);
      return {
        Position: index + 1,
        Player: player.name,
        Points: player.score,
        "Games Won": player.gamesWon,
        "Games Lost": player.gamesLost,
        Differential: player.gameDifferential,
        "H2H Win": wonByH2H ? "Yes" : ""
      };
    });
    
    const detailedSheet = XLSX.utils.json_to_sheet(detailedData);
    XLSX.utils.book_append_sheet(workbook, detailedSheet, "Detailed Standings");
    
    // Sheet 3: Match Results
    const matchResultsData = [];
    
    matches.forEach(match => {
      // Court 1
      const teamA1Players = match.court1.teamA.map(id => getPlayerName(id)).join(' & ');
      const teamB1Players = match.court1.teamB.map(id => getPlayerName(id)).join(' & ');
      
      // Court 2
      const teamA2Players = match.court2.teamA.map(id => getPlayerName(id)).join(' & ');
      const teamB2Players = match.court2.teamB.map(id => getPlayerName(id)).join(' & ');
      
      // Add Court 1 data
      matchResultsData.push({
        Round: match.round,
        Time: match.time,
        Court: "Court 5",
        "Team A": teamA1Players,
        "Games A": match.court1.gamesA !== null ? match.court1.gamesA : "-",
        "Score A": match.court1.scoreA !== null ? match.court1.scoreA : "-",
        "Team B": teamB1Players,
        "Games B": match.court1.gamesB !== null ? match.court1.gamesB : "-",
        "Score B": match.court1.scoreB !== null ? match.court1.scoreB : "-"
      });
      
      // Add Court 2 data
      matchResultsData.push({
        Round: match.round,
        Time: match.time,
        Court: "Court 6",
        "Team A": teamA2Players,
        "Games A": match.court2.gamesA !== null ? match.court2.gamesA : "-",
        "Score A": match.court2.scoreA !== null ? match.court2.scoreA : "-",
        "Team B": teamB2Players,
        "Games B": match.court2.gamesB !== null ? match.court2.gamesB : "-",
        "Score B": match.court2.scoreB !== null ? match.court2.scoreB : "-"
      });
    });
    
    const matchResultsSheet = XLSX.utils.json_to_sheet(matchResultsData);
    XLSX.utils.book_append_sheet(workbook, matchResultsSheet, "Match Results");
    
    // Sheet 4: Match Schedule
    const scheduleData = [];
    
    matches.forEach(match => {
      scheduleData.push({
        Round: match.round,
        Time: match.time,
        Court: "Court 5",
        "Team A": match.court1.teamA.map(id => getPlayerName(id)).join(' & '),
        "Team B": match.court1.teamB.map(id => getPlayerName(id)).join(' & ')
      });
      
      scheduleData.push({
        Round: match.round,
        Time: match.time,
        Court: "Court 6",
        "Team A": match.court2.teamA.map(id => getPlayerName(id)).join(' & '),
        "Team B": match.court2.teamB.map(id => getPlayerName(id)).join(' & ')
      });
      
      scheduleData.push({
        Round: match.round,
        Time: match.time,
        Court: "Not Playing",
        "Team A": getPlayerName(match.notPlaying),
        "Team B": ""
      });
    });
    
    const scheduleSheet = XLSX.utils.json_to_sheet(scheduleData);
    XLSX.utils.book_append_sheet(workbook, scheduleSheet, "Match Schedule");
    
    // Sheet 5: Head-to-Head Records
    const h2hRecords = buildHeadToHeadRecords();
    const h2hData = [];
    
    players.forEach(player => {
      const row = {
        Player: player.name
      };
      
      players.forEach(opponent => {
        if (player.id !== opponent.id) {
          row[opponent.name] = h2hRecords[player.id][opponent.id];
        } else {
          row[opponent.name] = "-";
        }
      });
      
      h2hData.push(row);
    });
    
    const h2hSheet = XLSX.utils.json_to_sheet(h2hData);
    XLSX.utils.book_append_sheet(workbook, h2hSheet, "Head-to-Head");
    
    // Generate filename with date
    const fileName = `Padel_Tournament_Results_${exportDate.replace(/\//g, '-')}.xlsx`;
    
    // Export the file
    XLSX.writeFile(workbook, fileName);
  };

  // Render number buttons for games
  const renderGameButtons = (court, team) => {
    const options = [0, 1, 2, 3, 4, 5, 6];
    const current = 
      court === 1 
        ? (team === 'A' ? currentMatch.court1.gamesA : currentMatch.court1.gamesB)
        : (team === 'A' ? currentMatch.court2.gamesA : currentMatch.court2.gamesB);
    
    return (
      <div className="flex flex-wrap gap-2">
        {options.map(value => (
          <button
            key={value}
            className={`w-14 h-14 text-3xl font-bold rounded-lg border-2 ${
              current === value
                ? 'bg-blue-500 text-white border-blue-700'
                : 'bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200'
            }`}
            onClick={() => updateGames(court, team, value)}
          >
            {value}
          </button>
        ))}
        <button
          className="w-14 h-14 text-xl font-bold rounded-lg bg-red-100 text-red-800 border-2 border-red-300 hover:bg-red-200"
          onClick={() => updateGames(court, team, null)}
        >
          Clear
        </button>
      </div>
    );
  };

  // Render tennis score buttons
  const renderScoreButtons = (court, team) => {
    const current = 
      court === 1 
        ? (team === 'A' ? currentMatch.court1.scoreA : currentMatch.court1.scoreB)
        : (team === 'A' ? currentMatch.court2.scoreA : currentMatch.court2.scoreB);
    
    return (
      <div className="flex flex-wrap gap-2">
        {tennisScores.map(value => (
          <button
            key={value}
            className={`w-14 h-14 text-2xl font-bold rounded-lg border-2 ${
              current === value
                ? 'bg-green-500 text-white border-green-700'
                : 'bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200'
            }`}
            onClick={() => updateScore(court, team, value)}
          >
            {value}
          </button>
        ))}
        <button
          className="w-14 h-14 text-xl font-bold rounded-lg bg-red-100 text-red-800 border-2 border-red-300 hover:bg-red-200"
          onClick={() => updateScore(court, team, null)}
        >
          Clear
        </button>
      </div>
    );
  };

  // Render team
  const renderTeam = (court, team) => {
    return (
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <div>
            <div className="text-3xl font-bold">
              {getTeamName(court, team)}
            </div>
            <div className="text-xl">
              Games: {getGames(court, team)}
              {getScore(court, team) !== '-' && `, Current: ${getScore(court, team)}`}
            </div>
          </div>
          <div className="text-2xl font-bold bg-blue-100 px-3 py-1 rounded-lg">
            Points: {getTournamentPoints(court, team)}
          </div>
        </div>
        
        {inputMode === 'games' ? 
          renderGameButtons(court, team) : 
          renderScoreButtons(court, team)}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-4xl font-bold text-center text-blue-800">Padel Tournament</h1>
        <div className="flex justify-center mt-4 flex-wrap">
          <button
            className={`px-6 py-3 text-2xl font-bold ${
              viewMode === 'input' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
            } ${viewMode === 'input' ? 'rounded-l-lg' : 'rounded-tl-lg rounded-bl-lg'}`}
            onClick={() => setViewMode('input')}
          >
            Input Scores
          </button>
          <button
            className={`px-6 py-3 text-2xl font-bold ${
              viewMode === 'standings' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
            onClick={() => setViewMode('standings')}
          >
            Standings
          </button>
          <button
            className={`px-6 py-3 text-2xl font-bold ${
              viewMode === 'detailedStandings' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
            } ${viewMode === 'detailedStandings' ? 'rounded-r-lg' : 'rounded-tr-lg rounded-br-lg'}`}
            onClick={() => {
              setViewMode('detailedStandings');
              // When switching to detailed view, recalculate head-to-head
              sortPlayersWithHeadToHead();
            }}
          >
            Detailed
          </button>
        </div>
        
        {/* Export Button */}
        <div className="mt-4 flex justify-center">
          <button
            className="px-6 py-3 text-2xl font-bold bg-green-600 text-white rounded-lg flex items-center"
            onClick={exportToExcel}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export to Excel
          </button>
        </div>
      </header>

      {/* Score Input View */}
      {viewMode === 'input' && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <button
              className="px-4 py-2 text-2xl font-bold bg-blue-100 text-blue-800 rounded-lg"
              onClick={prevRound}
              disabled={currentRound === 1}
            >
              &lt; Prev
            </button>
            <h2 className="text-3xl font-bold">
              Round {currentRound} - {currentMatch.time}
            </h2>
            <button
              className="px-4 py-2 text-2xl font-bold bg-blue-100 text-blue-800 rounded-lg"
              onClick={nextRound}
              disabled={currentRound === matches.length}
            >
              Next &gt;
            </button>
          </div>

          {/* Input Mode Toggle */}
          <div className="flex justify-center mb-6">
            <button
              className={`px-4 py-2 text-xl font-bold rounded-lg ${
                inputMode === 'games' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
              } mr-2`}
              onClick={() => setInputMode('games')}
            >
              Games Won
            </button>
            <button
              className={`px-4 py-2 text-xl font-bold rounded-lg ${
                inputMode === 'points' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
              onClick={() => setInputMode('points')}
            >
              Current Point
            </button>
          </div>

          {/* Not Playing */}
          <div className="text-center mb-6 p-2 bg-gray-100 rounded-lg">
            <p className="text-2xl">
              <span className="font-bold">Not Playing:</span>{' '}
              {getPlayerName(currentMatch.notPlaying)}
            </p>
          </div>

          {/* Court 1 */}
          <div className="mb-8 p-4 bg-blue-50 rounded-xl">
            <h3 className="text-2xl font-bold text-center mb-4">Court 5</h3>
            
            {/* Team A */}
            {renderTeam(1, 'A')}
            
            <div className="flex justify-center my-3">
              <div className="w-full border-t-4 border-blue-300"></div>
            </div>
            
            {/* Team B */}
            {renderTeam(1, 'B')}
          </div>

          {/* Court 2 */}
          <div className="p-4 bg-green-50 rounded-xl">
            <h3 className="text-2xl font-bold text-center mb-4">Court 6</h3>
            
            {/* Team A */}
            {renderTeam(2, 'A')}
            
            <div className="flex justify-center my-3">
              <div className="w-full border-t-4 border-green-300"></div>
            </div>
            
            {/* Team B */}
            {renderTeam(2, 'B')}
          </div>
        </div>
      )}

      {/* Standings View */}
      {viewMode === 'standings' && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-3xl font-bold text-center mb-6">Tournament Standings</h2>
          
          <div className="overflow-hidden">
            {[...players].sort((a, b) => b.score - a.score).map((player, index) => (
              <div 
                key={player.id} 
                className={`flex justify-between items-center p-4 ${
                  index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                } ${index === 0 ? 'bg-yellow-100' : ''}`}
              >
                <div className="flex items-center">
                  <span className="text-3xl font-bold w-12">{index + 1}.</span>
                  <span className="text-3xl">{player.name}</span>
                </div>
                <span className="text-4xl font-bold">{player.score}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Detailed Standings View */}
      {viewMode === 'detailedStandings' && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-3xl font-bold text-center mb-6">Detailed Standings</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-xl">
              <thead className="bg-blue-100">
                <tr>
                  <th className="p-3 text-left">Pos</th>
                  <th className="p-3 text-left">Player</th>
                  <th className="p-3 text-center">Points</th>
                  <th className="p-3 text-center">Games Won</th>
                  <th className="p-3 text-center">Games Lost</th>
                  <th className="p-3 text-center">Diff</th>
                </tr>
              </thead>
              <tbody>
                {sortPlayersWithHeadToHead().map((player, index, array) => {
                  // Determine if this player won by head-to-head
                  const wonByH2H = headToHeadWinners.includes(player.id);
                  
                  // Determine row class based on position and head-to-head result
                  let rowClass = `${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`;
                  if (index === 0) rowClass = 'bg-yellow-100';
                  if (wonByH2H) rowClass = 'bg-green-100'; // Highlight head-to-head winners
                  
                  return (
                    <tr 
                      key={player.id} 
                      className={rowClass}
                    >
                      <td className="p-3 text-center font-bold">{index + 1}</td>
                      <td className="p-3 font-bold">
                        {player.name}
                        {wonByH2H && (
                          <span className="ml-2 text-sm bg-green-600 text-white px-2 py-1 rounded-full">
                            H2H
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-center font-bold">{player.score}</td>
                      <td className="p-3 text-center">{player.gamesWon}</td>
                      <td className="p-3 text-center">{player.gamesLost}</td>
                      <td className="p-3 text-center font-bold">{player.gameDifferential}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {/* Explanation for H2H badge */}
          <div className="mt-4 bg-green-100 p-3 rounded-lg border border-green-300">
            <p className="text-lg">
              <span className="font-bold mr-2">Note:</span>
              Players marked with <span className="bg-green-600 text-white px-2 py-1 rounded-full mx-1 text-sm">H2H</span> are positioned based on 
              their head-to-head record against players with equal points, game differential, and games won.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PadelTournamentApp;