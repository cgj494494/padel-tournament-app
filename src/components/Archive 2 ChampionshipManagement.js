import React, { useState, useEffect } from 'react';

const ChampionshipManagement = ({ saveLastUsed }) => {
  const [view, setView] = useState('list');
  const [championships, setChampionships] = useState([]);
  const [currentChampionship, setCurrentChampionship] = useState(null);
  const [currentSession, setCurrentSession] = useState(null);
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    loadChampionships();
    loadPlayers();
  }, []);

  const loadChampionships = () => {
    const saved = localStorage.getItem('padelChampionships');
    if (saved) {
      setChampionships(JSON.parse(saved));
    }
  };

  const saveChampionships = (data) => {
    localStorage.setItem('padelChampionships', JSON.stringify(data));
    setChampionships(data);
  };

  const loadPlayers = () => {
    const saved = localStorage.getItem('padelTournamentPlayers');
    if (saved) {
      setPlayers(JSON.parse(saved));
    }
  };

  const ChampionshipList = () => (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Championships</h1>
          <p className="text-gray-600 mt-2">Long-running padel competitions</p>
        </div>
        <button
          onClick={() => setView('create')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center space-x-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>New Championship</span>
        </button>
      </div>

      {championships.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <div className="text-6xl mb-4">🏆</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">No Championships Yet</h3>
          <p className="text-gray-600 mb-6">Create your first championship to start tracking long-term competitions</p>
          <button
            onClick={() => setView('create')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold"
          >
            Create First Championship
          </button>
        </div>
      ) : (
        <div className="grid gap-6">
          {championships.map((championship) => (
            <div
              key={championship.id}
              onClick={() => {
                setCurrentChampionship(championship);
                setView('detail');
                if (saveLastUsed) {
                  saveLastUsed(championship.id, championship.name, 'championship');
                }
              }}
              className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{championship.name}</h3>
                  <p className="text-gray-600">Started {new Date(championship.startDate).toLocaleDateString()}</p>
                  <p className="text-sm text-blue-600 mt-1">
                    {championship.players?.length || 0} players • {championship.sessions?.length || 0} sessions
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    Active
                  </span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const ChampionshipCreate = () => {
    const [name, setName] = useState('');
    const [selectedPlayers, setSelectedPlayers] = useState([]);

    const handleCreate = () => {
      if (!name.trim() || selectedPlayers.length < 4) {
        alert('Please enter a name and select at least 4 players');
        return;
      }

      const newChampionship = {
        id: Date.now(),
        name: name.trim(),
        startDate: new Date().toISOString(),
        players: selectedPlayers,
        sessions: [],
        matches: [],
        standings: selectedPlayers.map(playerId => ({
          playerId,
          points: 0,
          matchesPlayed: 0,
          matchesWon: 0,
          setsWon: 0,
          setsLost: 0,
          gamesWon: 0,
          gamesLost: 0
        }))
      };

      const updated = [...championships, newChampionship];
      saveChampionships(updated);
      setCurrentChampionship(newChampionship);
      setView('detail');
    };

    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="flex items-center mb-6">
          <button
            onClick={() => setView('list')}
            className="mr-4 p-2 hover:bg-gray-100 rounded-lg"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Create Championship</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Championship Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Summer Championship 2025"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Players (minimum 4)</label>
              <div className="border border-gray-300 rounded-xl p-4 max-h-60 overflow-y-auto">
                {players.filter(p => p.isActive).length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No active players found.</p>
                    <p className="text-sm mt-2">Go to Tournament → Player Management to add players first.</p>
                  </div>
                ) : (
                  players.filter(p => p.isActive).map((player) => (
                    <label key={player.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg">
                      <input
                        type="checkbox"
                        checked={selectedPlayers.includes(player.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedPlayers([...selectedPlayers, player.id]);
                          } else {
                            setSelectedPlayers(selectedPlayers.filter(id => id !== player.id));
                          }
                        }}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="font-medium">{player.firstName} {player.surname}</span>
                      <span className="text-sm text-gray-500">({player.userId})</span>
                    </label>
                  ))
                )}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Selected: {selectedPlayers.length} players
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setView('list')}
                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 rounded-xl font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!name.trim() || selectedPlayers.length < 4}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-xl font-semibold"
              >
                Create Championship
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ChampionshipDetail = () => {
    const [activeTab, setActiveTab] = useState('standings');

    const startNewSession = () => {
      const newSession = {
        id: Date.now(),
        championshipId: currentChampionship.id,
        date: new Date().toISOString().split('T')[0],
        attendees: [],
        matches: []
      };
      setCurrentSession(newSession);
      setView('session');
    };

    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <button
              onClick={() => setView('list')}
              className="mr-4 p-2 hover:bg-gray-100 rounded-lg"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{currentChampionship.name}</h1>
              <p className="text-gray-600">Started {new Date(currentChampionship.startDate).toLocaleDateString()}</p>
            </div>
          </div>
          <button
            onClick={startNewSession}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center space-x-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Record Match</span>
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="flex border-b border-gray-200">
            {[
              { id: 'standings', label: 'Standings', icon: '🏆' },
              { id: 'sessions', label: 'Recent Matches', icon: '📅' },
              { id: 'players', label: 'Players', icon: '👥' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 font-semibold flex items-center space-x-2 ${
                  activeTab === tab.id 
                    ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === 'standings' && (
              <div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-bold">Pos</th>
                        <th className="text-left py-3 px-4 font-bold">Player</th>
                        <th className="text-center py-3 px-4 font-bold">Points</th>
                        <th className="text-center py-3 px-4 font-bold">Matches</th>
                        <th className="text-center py-3 px-4 font-bold">Games +/-</th>
                        <th className="text-center py-3 px-4 font-bold">Win %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentChampionship.standings
                        ?.sort((a, b) => {
                          if (b.points !== a.points) return b.points - a.points;
                          return (b.gamesWon - b.gamesLost) - (a.gamesWon - a.gamesLost);
                        })
                        .map((standing, index) => {
                          const player = players.find(p => p.id === standing.playerId);
                          const winRate = standing.matchesPlayed > 0 ? Math.round((standing.matchesWon / standing.matchesPlayed) * 100) : 0;
                          const gameDiff = standing.gamesWon - standing.gamesLost;
                          
                          return (
                            <tr key={standing.playerId} className={`border-b border-gray-100 ${index < 3 ? 'bg-yellow-50' : ''}`}>
                              <td className="py-3 px-4 font-bold text-lg">
                                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                              </td>
                              <td className="py-3 px-4">
                                <div className="font-bold">
                                  {player ? `${player.firstName} ${player.surname}` : 'Unknown Player'}
                                </div>
                                <div className="text-sm text-gray-600">{player?.userId}</div>
                              </td>
                              <td className="py-3 px-4 text-center font-bold text-blue-600 text-xl">{standing.points}</td>
                              <td className="py-3 px-4 text-center">{standing.matchesPlayed}</td>
                              <td className="py-3 px-4 text-center">
                                <span className={gameDiff >= 0 ? 'text-green-600' : 'text-red-600'}>
                                  {gameDiff >= 0 ? '+' : ''}{gameDiff}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-center">{winRate}%</td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'sessions' && (
              <div>
                {!currentChampionship.matches || currentChampionship.matches.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🎾</div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">No Matches Yet</h3>
                    <p className="text-gray-600 mb-6">Record your first match to get started</p>
                    <button
                      onClick={startNewSession}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold"
                    >
                      Record First Match
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {currentChampionship.matches?.slice(-10).reverse().map((match) => (
                      <div key={match.id} className="p-4 border border-gray-200 rounded-xl">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-bold">
                              {match.teamA?.map(id => {
                                const player = players.find(p => p.id === id);
                                return player ? `${player.firstName} ${player.surname}` : 'Unknown';
                              }).join(' & ')}
                              {' vs '}
                              {match.teamB?.map(id => {
                                const player = players.find(p => p.id === id);
                                return player ? `${player.firstName} ${player.surname}` : 'Unknown';
                              }).join(' & ')}
                            </div>
                            <div className="text-sm text-gray-600">
                              {new Date(match.timestamp).toLocaleDateString()} at {new Date(match.timestamp).toLocaleTimeString()}
                            </div>
                          </div>
                          <div className="text-xl font-bold">
                            {match.scoreA} - {match.scoreB}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'players' && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentChampionship.players?.map((playerId) => {
                  const player = players.find(p => p.id === playerId);
                  const standing = currentChampionship.standings?.find(s => s.playerId === playerId);
                  const winRate = standing?.matchesPlayed > 0 ? Math.round((standing.matchesWon / standing.matchesPlayed) * 100) : 0;
                  
                  return (
                    <div key={playerId} className="p-4 border border-gray-200 rounded-xl">
                      <h4 className="font-bold text-lg">
                        {player ? `${player.firstName} ${player.surname}` : 'Unknown'}
                      </h4>
                      <p className="text-sm text-gray-600 mb-3">{player?.userId}</p>
                      <div className="text-sm space-y-1">
                        <p>Points: <span className="font-bold text-blue-600">{standing?.points || 0}</span></p>
                        <p>Matches: {standing?.matchesPlayed || 0} ({winRate}% win rate)</p>
                        <p>Games: {standing?.gamesWon || 0} - {standing?.gamesLost || 0}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const SessionView = () => {
    const [selectedPlayers, setSelectedPlayers] = useState([]);

    const continueToMatches = () => {
      if (selectedPlayers.length < 4) {
        alert('Please select at least 4 players for the session');
        return;
      }
      
      setCurrentSession({
        ...currentSession,
        attendees: selectedPlayers
      });
      setView('match');
    };

    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center mb-6">
          <button
            onClick={() => setView('detail')}
            className="mr-4 p-2 hover:bg-gray-100 rounded-lg"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Record Match</h1>
            <p className="text-gray-600">{currentChampionship.name} • {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Who is Playing?</h3>
          <p className="text-gray-600 mb-6">Select players for this match</p>

          <div className="grid md:grid-cols-2 gap-4 mb-8">
            {currentChampionship.players?.map((playerId) => {
              const player = players.find(p => p.id === playerId);
              const isSelected = selectedPlayers.includes(playerId);
              
              return (
                <label
                  key={playerId}
                  className={`flex items-center space-x-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    isSelected 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedPlayers([...selectedPlayers, playerId]);
                      } else {
                        setSelectedPlayers(selectedPlayers.filter(id => id !== playerId));
                      }
                    }}
                    className="w-5 h-5 text-blue-600"
                  />
                  <div>
                    <div className="font-bold text-lg">
                      {player ? `${player.firstName} ${player.surname}` : 'Unknown Player'}
                    </div>
                    <div className="text-sm text-gray-600">{player?.userId}</div>
                  </div>
                </label>
              );
            })}
          </div>

          <div className="flex items-center justify-between">
            <p className="text-gray-600">
              Selected: <span className="font-bold">{selectedPlayers.length}</span> players (need 4 for doubles)
            </p>
            <button
              onClick={continueToMatches}
              disabled={selectedPlayers.length < 4}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-xl font-semibold"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  };

  const MatchView = () => {
    const [teamA, setTeamA] = useState([]);
    const [teamB, setTeamB] = useState([]);
    const [scoreA, setScoreA] = useState('');
    const [scoreB, setScoreB] = useState('');

    const calculatePoints = (gamesA, gamesB) => {
      const diff = gamesA - gamesB;
      if (diff >= 2) return [3, 0];
      if (diff === 1) return [2, 0];
      if (diff === 0) return [1, 1];
      if (diff === -1) return [0, 2];
      return [0, 3];
    };

    const recordMatch = () => {
      if (teamA.length !== 2 || teamB.length !== 2) {
        alert('Please select 2 players for each team');
        return;
      }
      
      if (!scoreA || !scoreB) {
        alert('Please enter scores for both teams');
        return;
      }

      const gamesA = parseInt(scoreA);
      const gamesB = parseInt(scoreB);
      const [pointsA, pointsB] = calculatePoints(gamesA, gamesB);

      const match = {
        id: Date.now(),
        teamA,
        teamB,
        scoreA: gamesA,
        scoreB: gamesB,
        pointsA,
        pointsB,
        timestamp: new Date().toISOString()
      };

      const updatedChampionships = championships.map(c => {
        if (c.id === currentChampionship.id) {
          const updatedMatches = [...(c.matches || []), match];
          
          const updatedStandings = c.standings.map(standing => {
            if (teamA.includes(standing.playerId)) {
              return {
                ...standing,
                points: standing.points + pointsA,
                matchesPlayed: standing.matchesPlayed + 1,
                matchesWon: pointsA > pointsB ? standing.matchesWon + 1 : standing.matchesWon,
                gamesWon: standing.gamesWon + gamesA,
                gamesLost: standing.gamesLost + gamesB
              };
            }
            if (teamB.includes(standing.playerId)) {
              return {
                ...standing,
                points: standing.points + pointsB,
                matchesPlayed: standing.matchesPlayed + 1,
                matchesWon: pointsB > pointsA ? standing.matchesWon + 1 : standing.matchesWon,
                gamesWon: standing.gamesWon + gamesB,
                gamesLost: standing.gamesLost + gamesA
              };
            }
            return standing;
          });
          
          return {
            ...c,
            matches: updatedMatches,
            standings: updatedStandings.sort((a, b) => b.points - a.points)
          };
        }
        return c;
      });

      saveChampionships(updatedChampionships);
      setCurrentChampionship(updatedChampionships.find(c => c.id === currentChampionship.id));

      alert(`Match recorded successfully!`);
      
      setTeamA([]);
      setTeamB([]);
      setScoreA('');
      setScoreB('');
    };

    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <button
              onClick={() => setView('session')}
              className="mr-4 p-2 hover:bg-gray-100 rounded-lg"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Record Match Result</h1>
              <p className="text-gray-600">{new Date().toLocaleDateString()}</p>
            </div>
          </div>
          <button
            onClick={() => setView('detail')}
            className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-xl font-semibold"
          >
            Back to Championship
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="grid lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">Form Teams</h3>
              
              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-3">Available Players (click to assign to teams)</h4>
                <div className="grid grid-cols-1 gap-2">
                  {currentSession.attendees?.map((playerId) => {
                    const player = players.find(p => p.id === playerId);
                    const inTeamA = teamA.includes(playerId);
                    const inTeamB = teamB.includes(playerId);
                    const isAssigned = inTeamA || inTeamB;
                    
                    return (
                      <div
                        key={playerId}
                        className={`p-3 rounded-lg border text-center cursor-pointer transition-all ${
                          inTeamA ? 'bg-blue-100 border-blue-500' :
                          inTeamB ? 'bg-green-100 border-green-500' :
                          'bg-gray-50 border-gray-200 hover:border-gray-400'
                        }`}
                        onClick={() => {
                          if (isAssigned) {
                            setTeamA(teamA.filter(id => id !== playerId));
                            setTeamB(teamB.filter(id => id !== playerId));
                          } else if (teamA.length < 2) {
                            setTeamA([...teamA, playerId]);
                          } else if (teamB.length < 2) {
                            setTeamB([...teamB, playerId]);
                          } else {
                            alert('Both teams are full! Click a player to remove them first.');
                          }
                        }}
                      >
                        <div className="font-medium">
                          {player ? `${player.firstName} ${player.surname}` : 'Unknown'}
                        </div>
                        {inTeamA && <div className="text-xs text-blue-600 font-bold">Team A</div>}
                        {inTeamB && <div className="text-xs text-green-600 font-bold">Team B</div>}
                        {!isAssigned && <div className="text-xs text-gray-500">Click to assign</div>}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-bold text-blue-800 mb-2">Team A ({teamA.length}/2)</h4>
                  {teamA.map(playerId => {
                    const player = players.find(p => p.id === playerId);
                    return (
                      <div key={playerId} className="text-sm">
                        {player ? `${player.firstName} ${player.surname}` : 'Unknown'}
                      </div>
                    );
                  })}
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-bold text-green-800 mb-2">Team B ({teamB.length}/2)</h4>
                  {teamB.map(playerId => {
                    const player = players.find(p => p.id === playerId);
                    return (
                      <div key={playerId} className="text-sm">
                        {player ? `${player.firstName} ${player.surname}` : 'Unknown'}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Team A Games</label>
                  <input
                    type="number"
                    value={scoreA}
                    onChange={(e) => setScoreA(e.target.value)}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg text-center text-2xl font-bold"
                    placeholder="0"
                    min="0"
                    max="20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Team B Games</label>
                  <input
                    type="number"
                    value={scoreB}
                    onChange={(e) => setScoreB(e.target.value)}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg text-center text-2xl font-bold"
                    placeholder="0"
                    min="0"
                    max="20"
                  />
                </div>
              </div>

              {scoreA && scoreB && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-bold text-yellow-800 mb-2">Points Preview</h4>
                  <div className="text-sm">
                    {(() => {
                      const gamesA = parseInt(scoreA);
                      const gamesB = parseInt(scoreB);
                      const [pointsA, pointsB] = calculatePoints(gamesA, gamesB);
                      return `Team A will get ${pointsA} points, Team B will get ${pointsB} points`;
                    })()}
                  </div>
                </div>
              )}

              <button
                onClick={recordMatch}
                disabled={teamA.length !== 2 || teamB.length !== 2 || !scoreA || !scoreB}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 rounded-xl font-semibold text-lg"
              >
                Record Match
              </button>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4">Scoring Guide</h3>
              
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-bold text-green-800">Big Win (2+ games ahead)</h4>
                  <p className="text-sm text-green-700">Winner: 3 points • Loser: 0 points</p>
                  <p className="text-xs text-green-600">Examples: 6-4, 6-3, 6-2, etc.</p>
                </div>
                
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-bold text-blue-800">Close Win (1 game ahead)</h4>
                  <p className="text-sm text-blue-700">Winner: 2 points • Loser: 0 points</p>
                  <p className="text-xs text-blue-600">Examples: 6-5, 7-6, etc.</p>
                </div>
                
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <h4 className="font-bold text-purple-800">Draw (same games)</h4>
                  <p className="text-sm text-purple-700">Both teams: 1 point each</p>
                  <p className="text-xs text-purple-600">Examples: 6-6, 5-5, etc.</p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <h4 className="font-bold text-gray-800 mb-2">Quick Tips</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Click players to assign them to teams</li>
                  <li>• Each team needs exactly 2 players</li>
                  <li>• Enter the final game score for the set</li>
                  <li>• Points are awarded automatically</li>
                  <li>• You can record multiple matches in a row</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {view === 'list' && <ChampionshipList />}
      {view === 'create' && <ChampionshipCreate />}
      {view === 'detail' && <ChampionshipDetail />}
      {view === 'session' && <SessionView />}
      {view === 'match' && <MatchView />}
    </div>
  );
};

export default ChampionshipManagement;