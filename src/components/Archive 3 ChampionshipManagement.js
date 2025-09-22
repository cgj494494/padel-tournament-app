import React, { useState, useEffect } from 'react';

const ChampionshipManagement = ({ saveLastUsed }) => {
  const [view, setView] = useState('list');
  const [championships, setChampionships] = useState([]);
  const [currentChampionship, setCurrentChampionship] = useState(null);
  const [currentSession, setCurrentSession] = useState(null);
  const [players, setPlayers] = useState([]);
  const [fontSize, setFontSize] = useState('large'); // 'small', 'large'

  // Load font preference on mount
  useEffect(() => {
    const savedFontSize = localStorage.getItem('padelFontSize');
    if (savedFontSize) {
      setFontSize(savedFontSize);
    }
  }, []);

  // Save font preference when changed
  useEffect(() => {
    localStorage.setItem('padelFontSize', fontSize);
  }, [fontSize]);

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

  // Font Size Toggle Component
  const FontToggle = () => (
    <div className="fixed top-4 right-4 z-50 bg-white rounded-2xl shadow-lg border border-gray-200 p-2">
      <div className="flex items-center space-x-2">
        <span className={`text-sm ${fontSize === 'small' ? 'text-gray-400' : 'text-gray-600'}`}>A</span>
        <button
          onClick={() => setFontSize(fontSize === 'small' ? 'large' : 'small')}
          className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
            fontSize === 'large' ? 'bg-blue-600' : 'bg-gray-300'
          }`}
        >
          <span
            className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
              fontSize === 'large' ? 'translate-x-7' : 'translate-x-1'
            }`}
          />
        </button>
        <span className={`text-xl ${fontSize === 'large' ? 'text-gray-400' : 'text-gray-600'}`}>A</span>
      </div>
      <div className={`text-center mt-1 ${fontSize === 'small' ? 'text-xs' : 'text-sm'} text-gray-600`}>
        {fontSize === 'large' ? 'Large Text' : 'Small Text'}
      </div>
    </div>
  );

  // Dynamic CSS classes based on font size
  const getTextClasses = (type) => {
    const classes = {
      small: {
        h1: 'text-2xl',
        h2: 'text-xl',
        h3: 'text-lg',
        h4: 'text-base',
        body: 'text-sm',
        small: 'text-xs',
        button: 'text-sm px-4 py-2',
        input: 'text-sm px-3 py-2'
      },
      large: {
        h1: 'text-4xl',
        h2: 'text-3xl',
        h3: 'text-2xl',
        h4: 'text-xl',
        body: 'text-lg',
        small: 'text-base',
        button: 'text-xl px-8 py-4',
        input: 'text-xl px-6 py-4'
      }
    };
    return classes[fontSize][type];
  };

  const ChampionshipList = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <FontToggle />
      
      {/* Header with better spacing */}
      <div className="pt-20 pb-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h1 className={`${getTextClasses('h1')} font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4`}>
              Championships
            </h1>
            <p className={`${getTextClasses('body')} text-gray-600 max-w-2xl mx-auto`}>
              Manage your long-running padel competitions with professional scoring and detailed analytics
            </p>
          </div>

          {/* Action Button - Always visible and accessible */}
          <div className="flex justify-center mb-12">
            <button
              onClick={() => setView('create')}
              className={`${getTextClasses('button')} bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-3`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Create New Championship</span>
            </button>
          </div>

          {championships.length === 0 ? (
            <div className="bg-white rounded-3xl shadow-xl p-16 text-center max-w-2xl mx-auto">
              <div className="text-8xl mb-8">🏆</div>
              <h3 className={`${getTextClasses('h3')} font-bold text-gray-800 mb-6`}>No Championships Yet</h3>
              <p className={`${getTextClasses('body')} text-gray-600 mb-8 leading-relaxed`}>
                Create your first championship to start tracking long-term competitions with professional scoring
              </p>
              <button
                onClick={() => setView('create')}
                className={`${getTextClasses('button')} bg-green-600 hover:bg-green-700 text-white font-bold rounded-2xl shadow-lg transform hover:scale-105 transition-all`}
              >
                Create First Championship
              </button>
            </div>
          ) : (
            <div className="grid gap-8 max-w-4xl mx-auto">
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
                  className="bg-white rounded-3xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-[1.02]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className={`${getTextClasses('h3')} font-bold text-gray-800 mb-2`}>
                        {championship.name}
                      </h3>
                      <p className={`${getTextClasses('body')} text-gray-600 mb-4`}>
                        Started {new Date(championship.startDate).toLocaleDateString()}
                      </p>
                      <div className="flex items-center space-x-4">
                        <span className={`${getTextClasses('small')} px-4 py-2 bg-blue-100 text-blue-800 rounded-full font-medium`}>
                          {championship.players?.length || 0} players
                        </span>
                        <span className={`${getTextClasses('small')} px-4 py-2 bg-green-100 text-green-800 rounded-full font-medium`}>
                          {championship.matches?.length || 0} matches
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`${getTextClasses('small')} px-6 py-3 bg-green-100 text-green-800 rounded-full font-bold`}>
                        Active
                      </span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Bottom padding to ensure content is never cut off */}
      <div className="h-24"></div>
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <FontToggle />
        
        <div className="pt-20 pb-12">
          <div className="max-w-4xl mx-auto px-6">
            {/* Header with back button */}
            <div className="flex items-center mb-8">
              <button
                onClick={() => setView('list')}
                className={`${getTextClasses('button')} bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-2xl flex items-center space-x-2 mr-6`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Back</span>
              </button>
              <h1 className={`${getTextClasses('h1')} font-bold text-gray-800`}>Create Championship</h1>
            </div>

            <div className="bg-white rounded-3xl shadow-xl p-10">
              <div className="space-y-8">
                <div>
                  <label className={`block ${getTextClasses('h4')} font-bold text-gray-700 mb-4`}>
                    Championship Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Summer Championship 2025"
                    className={`w-full ${getTextClasses('input')} border-2 border-gray-300 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-200 transition-all`}
                  />
                </div>

                <div>
                  <label className={`block ${getTextClasses('h4')} font-bold text-gray-700 mb-4`}>
                    Select Players (minimum 4)
                  </label>
                  <div className="border-2 border-gray-300 rounded-2xl p-6 max-h-80 overflow-y-auto">
                    {players.filter(p => p.isActive).length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <p className={getTextClasses('body')}>No active players found.</p>
                        <p className={`${getTextClasses('small')} mt-2`}>
                          Go to Tournament → Player Management to add players first.
                        </p>
                      </div>
                    ) : (
                      <div className="grid gap-4">
                        {players.filter(p => p.isActive).map((player) => (
                          <label 
                            key={player.id} 
                            className={`flex items-center space-x-4 p-4 hover:bg-blue-50 rounded-2xl cursor-pointer transition-all ${
                              selectedPlayers.includes(player.id) ? 'bg-blue-50 border-2 border-blue-300' : 'border-2 border-transparent'
                            }`}
                          >
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
                              className="w-6 h-6 text-blue-600 rounded"
                            />
                            <div>
                              <span className={`${getTextClasses('body')} font-bold`}>
                                {player.firstName} {player.surname}
                              </span>
                              <span className={`${getTextClasses('small')} text-gray-500 ml-2`}>
                                ({player.userId})
                              </span>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className={`${getTextClasses('body')} text-gray-600 mt-4 text-center`}>
                    Selected: <span className="font-bold text-blue-600">{selectedPlayers.length}</span> players
                  </p>
                </div>
              </div>
            </div>

            {/* Fixed bottom buttons - always accessible */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-6">
              <div className="max-w-4xl mx-auto flex justify-between items-center">
                <button
                  onClick={() => setView('list')}
                  className={`${getTextClasses('button')} bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-2xl`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={!name.trim() || selectedPlayers.length < 4}
                  className={`${getTextClasses('button')} bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold rounded-2xl shadow-lg transform hover:scale-105 transition-all`}
                >
                  Create Championship
                </button>
              </div>
            </div>
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <FontToggle />
        
        <div className="pt-20 pb-32">
          <div className="max-w-5xl mx-auto px-6">
            {/* Header */}
            <div className="flex items-center mb-8">
              <button
                onClick={() => setView('detail')}
                className={`${getTextClasses('button')} bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-2xl flex items-center space-x-2 mr-6`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Back</span>
              </button>
              <div>
                <h1 className={`${getTextClasses('h1')} font-bold text-gray-800`}>Record Match</h1>
                <p className={`${getTextClasses('body')} text-gray-600`}>
                  {currentChampionship.name} • {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-xl p-10">
              <h3 className={`${getTextClasses('h3')} font-bold text-gray-800 mb-6`}>Who's Playing?</h3>
              <p className={`${getTextClasses('body')} text-gray-600 mb-8`}>Select players for this match</p>

              <div className="grid md:grid-cols-2 gap-6 mb-10">
                {currentChampionship.players?.map((playerId) => {
                  const player = players.find(p => p.id === playerId);
                  const isSelected = selectedPlayers.includes(playerId);
                  
                  return (
                    <label
                      key={playerId}
                      className={`flex items-center space-x-4 p-6 rounded-2xl border-3 cursor-pointer transition-all transform hover:scale-105 ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-50 shadow-lg' 
                          : 'border-gray-200 hover:border-blue-300 hover:shadow-lg'
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
                        className="w-6 h-6 text-blue-600 rounded"
                      />
                      <div>
                        <div className={`${getTextClasses('body')} font-bold text-gray-800`}>
                          {player ? `${player.firstName} ${player.surname}` : 'Unknown Player'}
                        </div>
                        <div className={`${getTextClasses('small')} text-gray-600`}>{player?.userId}</div>
                      </div>
                    </label>
                  );
                })}
              </div>

              <div className="text-center">
                <p className={`${getTextClasses('body')} text-gray-600 mb-2`}>
                  Selected: <span className="font-bold text-blue-600">{selectedPlayers.length}</span> players 
                  <span className="text-gray-500">(need 4 for doubles)</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Fixed bottom button - always accessible */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-6">
          <div className="max-w-5xl mx-auto text-center">
            <button
              onClick={continueToMatches}
              disabled={selectedPlayers.length < 4}
              className={`${getTextClasses('button')} bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold rounded-2xl shadow-xl transform hover:scale-105 transition-all`}
            >
              Continue to Match Entry
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

      alert('Match recorded successfully!');
      
      setTeamA([]);
      setTeamB([]);
      setScoreA('');
      setScoreB('');
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <FontToggle />
        
        <div className="pt-20 pb-32">
          <div className="max-w-6xl mx-auto px-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center">
                <button
                  onClick={() => setView('session')}
                  className={`${getTextClasses('button')} bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-2xl flex items-center space-x-2 mr-6`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  <span>Back</span>
                </button>
                <div>
                  <h1 className={`${getTextClasses('h1')} font-bold text-gray-800`}>Record Match Result</h1>
                  <p className={`${getTextClasses('body')} text-gray-600`}>{new Date().toLocaleDateString()}</p>
                </div>
              </div>
              <button
                onClick={() => setView('detail')}
                className={`${getTextClasses('button')} bg-green-600 hover:bg-green-700 text-white font-bold rounded-2xl`}
              >
                Finish Session
              </button>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Team Formation */}
              <div className="bg-white rounded-3xl shadow-xl p-8">
                <h3 className={`${getTextClasses('h3')} font-bold mb-6`}>Form Teams</h3>
                
                {/* Available Players */}
                <div className="mb-8">
                  <h4 className={`${getTextClasses('h4')} font-bold text-gray-700 mb-4`}>Available Players</h4>
                  <p className={`${getTextClasses('small')} text-gray-600 mb-4`}>Click to assign to teams</p>
                  <div className="grid gap-3">
                    {currentSession.attendees?.map((playerId) => {
                      const player = players.find(p => p.id === playerId);
                      const inTeamA = teamA.includes(playerId);
                      const inTeamB = teamB.includes(playerId);
                      const isAssigned = inTeamA || inTeamB;
                      
                      return (
                        <div
                          key={playerId}
                          className={`p-4 rounded-2xl border-2 text-center cursor-pointer transition-all transform hover:scale-105 ${
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
                          <div className={`${getTextClasses('body')} font-bold`}>
                            {player ? `${player.firstName} ${player.surname}` : 'Unknown'}
                          </div>
                          {inTeamA && <div className={`${getTextClasses('small')} text-blue-600 font-bold`}>Team A</div>}
                          {inTeamB && <div className={`${getTextClasses('small')} text-green-600 font-bold`}>Team B</div>}
                          {!isAssigned && <div className={`${getTextClasses('small')} text-gray-500`}>Click to assign</div>}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Team Display */}
                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div className="p-6 bg-blue-50 rounded-2xl border-2 border-blue-200">
                    <h4 className={`${getTextClasses('h4')} font-bold text-blue-800 mb-4`}>
                      Team A ({teamA.length}/2)
                    </h4>
                    {teamA.map(playerId => {
                      const player = players.find(p => p.id === playerId);
                      return (
                        <div key={playerId} className={`${getTextClasses('body')} mb-2`}>
                          {player ? `${player.firstName} ${player.surname}` : 'Unknown'}
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="p-6 bg-green-50 rounded-2xl border-2 border-green-200">
                    <h4 className={`${getTextClasses('h4')} font-bold text-green-800 mb-4`}>
                      Team B ({teamB.length}/2)
                    </h4>
                    {teamB.map(playerId => {
                      const player = players.find(p => p.id === playerId);
                      return (
                        <div key={playerId} className={`${getTextClasses('body')} mb-2`}>
                          {player ? `${player.firstName} ${player.surname}` : 'Unknown'}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Score Entry */}
                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div>
                    <label className={`block ${getTextClasses('h4')} font-bold text-gray-700 mb-3`}>Team A Games</label>
                    <input
                      type="number"
                      value={scoreA}
                      onChange={(e) => setScoreA(e.target.value)}
                      className={`w-full ${getTextClasses('input')} border-2 border-gray-300 rounded-2xl text-center font-bold focus:border-blue-500 focus:ring-4 focus:ring-blue-200`}
                      placeholder="0"
                      min="0"
                      max="20"
                    />
                  </div>
                  <div>
                    <label className={`block ${getTextClasses('h4')} font-bold text-gray-700 mb-3`}>Team B Games</label>
                    <input
                      type="number"
                      value={scoreB}
                      onChange={(e) => setScoreB(e.target.value)}
                      className={`w-full ${getTextClasses('input')} border-2 border-gray-300 rounded-2xl text-center font-bold focus:border-green-500 focus:ring-4 focus:ring-green-200`}
                      placeholder="0"
                      min="0"
                      max="20"
                    />
                  </div>
                </div>

                {/* Points Preview */}
                {scoreA && scoreB && (
                  <div className="mb-6 p-6 bg-yellow-50 border-2 border-yellow-200 rounded-2xl">
                    <h4 className={`${getTextClasses('h4')} font-bold text-yellow-800 mb-3`}>Points Preview</h4>
                    <div className={`${getTextClasses('body')} text-yellow-700`}>
                      {(() => {
                        const gamesA = parseInt(scoreA);
                        const gamesB = parseInt(scoreB);
                        const [pointsA, pointsB] = calculatePoints(gamesA, gamesB);
                        return `Team A will get ${pointsA} points, Team B will get ${pointsB} points`;
                      })()}
                    </div>
                  </div>
                )}
              </div>

              {/* Scoring Guide */}
              <div className="bg-white rounded-3xl shadow-xl p-8">
                <h3 className={`${getTextClasses('h3')} font-bold mb-6`}>Scoring Guide</h3>
                
                <div className="space-y-6">
                  <div className="p-6 bg-green-50 border-2 border-green-200 rounded-2xl">
                    <h4 className={`${getTextClasses('h4')} font-bold text-green-800 mb-2`}>Big Win (2+ games ahead)</h4>
                    <p className={`${getTextClasses('body')} text-green-700 mb-2`}>Winner: 3 points • Loser: 0 points</p>
                    <p className={`${getTextClasses('small')} text-green-600`}>Examples: 6-4, 6-3, 6-2, etc.</p>
                  </div>
                  
                  <div className="p-6 bg-blue-50 border-2 border-blue-200 rounded-2xl">
                    <h4 className={`${getTextClasses('h4')} font-bold text-blue-800 mb-2`}>Close Win (1 game ahead)</h4>
                    <p className={`${getTextClasses('body')} text-blue-700 mb-2`}>Winner: 2 points • Loser: 0 points</p>
                    <p className={`${getTextClasses('small')} text-blue-600`}>Examples: 6-5, 7-6, etc.</p>
                  </div>
                  
                  <div className="p-6 bg-purple-50 border-2 border-purple-200 rounded-2xl">
                    <h4 className={`${getTextClasses('h4')} font-bold text-purple-800 mb-2`}>Draw (same games)</h4>
                    <p className={`${getTextClasses('body')} text-purple-700 mb-2`}>Both teams: 1 point each</p>
                    <p className={`${getTextClasses('small')} text-purple-600`}>Examples: 6-6, 5-5, etc.</p>
                  </div>
                </div>

                <div className="mt-8 p-6 bg-gray-50 border-2 border-gray-200 rounded-2xl">
                  <h4 className={`${getTextClasses('h4')} font-bold text-gray-800 mb-4`}>Quick Tips</h4>
                  <ul className={`${getTextClasses('body')} text-gray-700 space-y-2`}>
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

        {/* Fixed bottom button - always accessible */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 p-6 shadow-2xl">
          <div className="max-w-6xl mx-auto text-center">
            <button
              onClick={recordMatch}
              disabled={teamA.length !== 2 || teamB.length !== 2 || !scoreA || !scoreB}
              className={`${getTextClasses('button')} bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold rounded-2xl shadow-xl transform hover:scale-105 transition-all`}
            >
              Record Match
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Add the missing ChampionshipDetail component
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <FontToggle />
        
        <div className="pt-20 pb-12">
          <div className="max-w-7xl mx-auto px-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center">
                <button
                  onClick={() => setView('list')}
                  className={`${getTextClasses('button')} bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-2xl flex items-center space-x-2 mr-6`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  <span>Back</span>
                </button>
                <div>
                  <h1 className={`${getTextClasses('h1')} font-bold text-gray-800`}>{currentChampionship.name}</h1>
                  <p className={`${getTextClasses('body')} text-gray-600`}>
                    Started {new Date(currentChampionship.startDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <button
                onClick={startNewSession}
                className={`${getTextClasses('button')} bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-2xl shadow-xl flex items-center space-x-3 transform hover:scale-105 transition-all`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Record Match</span>
              </button>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
              <div className="flex border-b-2 border-gray-200 bg-gray-50">
                {[
                  { id: 'standings', label: 'Standings', icon: '🏆' },
                  { id: 'sessions', label: 'Recent Matches', icon: '📅' },
                  { id: 'players', label: 'Players', icon: '👥' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 ${getTextClasses('button')} font-bold flex items-center justify-center space-x-3 transition-all ${
                      activeTab === tab.id 
                        ? 'border-b-4 border-blue-500 text-blue-600 bg-white shadow-lg' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-2xl">{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              <div className="p-8">
                {activeTab === 'standings' && (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-gray-200">
                          <th className={`text-left py-4 px-6 ${getTextClasses('h4')} font-bold`}>Pos</th>
                          <th className={`text-left py-4 px-6 ${getTextClasses('h4')} font-bold`}>Player</th>
                          <th className={`text-center py-4 px-6 ${getTextClasses('h4')} font-bold`}>Points</th>
                          <th className={`text-center py-4 px-6 ${getTextClasses('h4')} font-bold`}>Matches</th>
                          <th className={`text-center py-4 px-6 ${getTextClasses('h4')} font-bold`}>Games +/-</th>
                          <th className={`text-center py-4 px-6 ${getTextClasses('h4')} font-bold`}>Win %</th>
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
                              <tr key={standing.playerId} className={`border-b border-gray-100 hover:bg-gray-50 ${index < 3 ? 'bg-yellow-50' : ''}`}>
                                <td className={`py-4 px-6 ${getTextClasses('body')} font-bold text-2xl`}>
                                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                                </td>
                                <td className="py-4 px-6">
                                  <div className={`${getTextClasses('body')} font-bold text-gray-800`}>
                                    {player ? `${player.firstName} ${player.surname}` : 'Unknown Player'}
                                  </div>
                                  <div className={`${getTextClasses('small')} text-gray-600`}>{player?.userId}</div>
                                </td>
                                <td className={`py-4 px-6 text-center ${getTextClasses('h3')} font-bold text-blue-600`}>{standing.points}</td>
                                <td className={`py-4 px-6 text-center ${getTextClasses('body')}`}>{standing.matchesPlayed}</td>
                                <td className={`py-4 px-6 text-center ${getTextClasses('body')}`}>
                                  <span className={`font-bold ${gameDiff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {gameDiff >= 0 ? '+' : ''}{gameDiff}
                                  </span>
                                </td>
                                <td className={`py-4 px-6 text-center ${getTextClasses('body')} font-bold`}>{winRate}%</td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                )}

                {activeTab === 'sessions' && (
                  <div>
                    {!currentChampionship.matches || currentChampionship.matches.length === 0 ? (
                      <div className="text-center py-16">
                        <div className="text-8xl mb-6">🎾</div>
                        <h3 className={`${getTextClasses('h3')} font-bold text-gray-800 mb-4`}>No Matches Yet</h3>
                        <p className={`${getTextClasses('body')} text-gray-600 mb-8`}>Record your first match to get started</p>
                        <button
                          onClick={startNewSession}
                          className={`${getTextClasses('button')} bg-green-600 hover:bg-green-700 text-white font-bold rounded-2xl shadow-lg transform hover:scale-105 transition-all`}
                        >
                          Record First Match
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {currentChampionship.matches?.slice(-10).reverse().map((match) => (
                          <div key={match.id} className="p-6 border-2 border-gray-200 rounded-2xl hover:shadow-lg transition-shadow">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className={`${getTextClasses('body')} font-bold text-gray-800`}>
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
                                <div className={`${getTextClasses('small')} text-gray-600 mt-2`}>
                                  {new Date(match.timestamp).toLocaleDateString()} at {new Date(match.timestamp).toLocaleTimeString()}
                                </div>
                              </div>
                              <div className={`${getTextClasses('h3')} font-bold text-blue-600`}>
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
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {currentChampionship.players?.map((playerId) => {
                      const player = players.find(p => p.id === playerId);
                      const standing = currentChampionship.standings?.find(s => s.playerId === playerId);
                      const winRate = standing?.matchesPlayed > 0 ? Math.round((standing.matchesWon / standing.matchesPlayed) * 100) : 0;
                      
                      return (
                        <div key={playerId} className="p-6 border-2 border-gray-200 rounded-2xl hover:shadow-lg transition-all">
                          <h4 className={`${getTextClasses('body')} font-bold text-gray-800 mb-2`}>
                            {player ? `${player.firstName} ${player.surname}` : 'Unknown'}
                          </h4>
                          <p className={`${getTextClasses('small')} text-gray-600 mb-4`}>{player?.userId}</p>
                          <div className={`${getTextClasses('small')} space-y-2`}>
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
        </div>
      </div>
    );
  };

  return (
    <>
      {view === 'list' && <ChampionshipList />}
      {view === 'create' && <ChampionshipCreate />}
      {view === 'detail' && <ChampionshipDetail />}
      {view === 'session' && <SessionView />}
      {view === 'match' && <MatchView />}
    </>
  );
};

export default ChampionshipManagement;