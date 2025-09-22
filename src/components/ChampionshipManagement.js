import React, { useState, useEffect } from 'react';

const ChampionshipManagement = ({ saveLastUsed }) => {
  const [view, setView] = useState('list');
  const [championships, setChampionships] = useState([]);
  const [currentChampionship, setCurrentChampionship] = useState(null);
  const [currentSession, setCurrentSession] = useState(null);
  const [players, setPlayers] = useState([]);
  const [fontSize, setFontSize] = useState('large'); // Default to large for mobile

  // Load font preference
  useEffect(() => {
    const savedFontSize = localStorage.getItem('padelFontSize') || 'large';
    setFontSize(savedFontSize);
  }, []);

  // Save font preference
  useEffect(() => {
    localStorage.setItem('padelFontSize', fontSize);
    // Apply font size to document root for global effect
    document.documentElement.setAttribute('data-font-size', fontSize);
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

  // Font size classes - much more dramatic differences for mobile
  const getClasses = (element) => {
    const styles = {
      small: {
        title: 'text-2xl',
        heading: 'text-xl', 
        body: 'text-base',
        button: 'text-base px-4 py-3',
        input: 'text-base px-4 py-3',
        small: 'text-sm'
      },
      large: {
        title: 'text-5xl md:text-6xl',
        heading: 'text-3xl md:text-4xl',
        body: 'text-xl md:text-2xl',
        button: 'text-xl md:text-2xl px-8 py-6',
        input: 'text-xl md:text-2xl px-6 py-5', 
        small: 'text-lg md:text-xl'
      }
    };
    return styles[fontSize][element];
  };

  // Font Toggle Component - always visible
  const FontToggle = () => (
    <div className="fixed top-6 right-6 z-50 bg-white/95 backdrop-blur rounded-2xl shadow-2xl border border-gray-200 p-3">
      <div className="flex items-center space-x-3">
        <span className={`${fontSize === 'small' ? 'text-gray-400' : 'text-gray-600'} font-medium`}>A</span>
        <button
          onClick={() => setFontSize(fontSize === 'small' ? 'large' : 'small')}
          className={`relative inline-flex h-10 w-16 items-center rounded-full transition-all duration-300 ${
            fontSize === 'large' ? 'bg-gradient-to-r from-blue-500 to-purple-600' : 'bg-gray-300'
          }`}
        >
          <span
            className={`inline-block h-8 w-8 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${
              fontSize === 'large' ? 'translate-x-7' : 'translate-x-1'
            }`}
          />
        </button>
        <span className={`${fontSize === 'large' ? 'text-gray-400' : 'text-gray-600'} font-medium text-xl`}>A</span>
      </div>
      <div className={`text-center mt-2 ${getClasses('small')} text-gray-600 font-medium`}>
        {fontSize === 'large' ? 'Large' : 'Small'}
      </div>
    </div>
  );

  const ChampionshipList = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100">
      <FontToggle />
      
      {/* Safe area padding for mobile */}
      <div className="pt-20 pb-32 px-6">
        <div className="max-w-4xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className={`${getClasses('title')} font-black bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 bg-clip-text text-transparent mb-6`}>
              Championships
            </h1>
            <p className={`${getClasses('body')} text-gray-600 font-medium`}>
              Professional Padel Tournament Management
            </p>
          </div>

          {/* Create Button - Always prominent */}
          <div className="flex justify-center mb-12">
            <button
              onClick={() => setView('create')}
              className={`${getClasses('button')} bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-2xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-4`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
              </svg>
              <span>New Championship</span>
            </button>
          </div>

          {/* Championships List */}
          {championships.length === 0 ? (
            <div className="bg-white/80 backdrop-blur rounded-3xl shadow-2xl p-12 text-center border border-gray-200">
              <div className="text-8xl mb-8">🏆</div>
              <h3 className={`${getClasses('heading')} font-bold text-gray-800 mb-6`}>
                No Championships Yet
              </h3>
              <p className={`${getClasses('body')} text-gray-600 mb-10 leading-relaxed`}>
                Create your first championship to start tracking professional padel competitions
              </p>
              <button
                onClick={() => setView('create')}
                className={`${getClasses('button')} bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold rounded-2xl shadow-xl transform hover:scale-105 transition-all`}
              >
                Get Started
              </button>
            </div>
          ) : (
            <div className="space-y-8">
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
                  className="bg-white/90 backdrop-blur rounded-3xl shadow-2xl p-8 hover:shadow-3xl transition-all duration-300 cursor-pointer transform hover:scale-[1.02] border border-gray-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className={`${getClasses('heading')} font-bold text-gray-800 mb-3`}>
                        {championship.name}
                      </h3>
                      <p className={`${getClasses('body')} text-gray-600 mb-6`}>
                        Started {new Date(championship.startDate).toLocaleDateString()}
                      </p>
                      <div className="flex flex-wrap gap-4">
                        <span className={`${getClasses('small')} px-6 py-3 bg-blue-100 text-blue-800 rounded-2xl font-bold`}>
                          {championship.players?.length || 0} Players
                        </span>
                        <span className={`${getClasses('small')} px-6 py-3 bg-green-100 text-green-800 rounded-2xl font-bold`}>
                          {championship.matches?.length || 0} Matches
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6">
                      <span className={`${getClasses('small')} px-6 py-3 bg-emerald-100 text-emerald-800 rounded-2xl font-bold`}>
                        Active
                      </span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100">
        <FontToggle />
        
        <div className="pt-20 pb-40 px-6">
          <div className="max-w-4xl mx-auto">
            
            {/* Header with back button */}
            <div className="flex items-center mb-10">
              <button
                onClick={() => setView('list')}
                className={`${getClasses('button')} bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-2xl flex items-center space-x-4 mr-8 shadow-lg`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Back</span>
              </button>
              <h1 className={`${getClasses('heading')} font-bold text-gray-800`}>
                Create Championship
              </h1>
            </div>

            {/* Form */}
            <div className="bg-white/90 backdrop-blur rounded-3xl shadow-2xl p-10 border border-gray-200">
              <div className="space-y-10">
                
                {/* Name Input */}
                <div>
                  <label className={`block ${getClasses('body')} font-bold text-gray-700 mb-4`}>
                    Championship Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Summer Championship 2025"
                    className={`w-full ${getClasses('input')} border-3 border-gray-300 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-200 transition-all font-medium bg-white/80`}
                  />
                </div>

                {/* Player Selection */}
                <div>
                  <label className={`block ${getClasses('body')} font-bold text-gray-700 mb-4`}>
                    Select Players (minimum 4)
                  </label>
                  <div className="border-3 border-gray-300 rounded-2xl p-6 max-h-80 overflow-y-auto bg-gray-50/50">
                    {players.filter(p => p.isActive).length === 0 ? (
                      <div className="text-center py-12">
                        <div className="text-6xl mb-4">👥</div>
                        <p className={`${getClasses('body')} text-gray-500 font-medium`}>No active players found</p>
                        <p className={`${getClasses('small')} text-gray-400 mt-3`}>
                          Add players in Tournament → Player Management first
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {players.filter(p => p.isActive).map((player) => (
                          <label 
                            key={player.id} 
                            className={`flex items-center space-x-6 p-6 hover:bg-blue-50 rounded-2xl cursor-pointer transition-all border-2 ${
                              selectedPlayers.includes(player.id) ? 'bg-blue-50 border-blue-300' : 'border-transparent hover:border-blue-200'
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
                              className="w-6 h-6 text-blue-600 rounded-lg"
                            />
                            <div>
                              <span className={`${getClasses('body')} font-bold text-gray-800`}>
                                {player.firstName} {player.surname}
                              </span>
                              <span className={`${getClasses('small')} text-gray-500 ml-3`}>
                                ({player.userId})
                              </span>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-center mt-6">
                    <p className={`${getClasses('body')} text-gray-600 font-medium`}>
                      Selected: <span className="font-bold text-blue-600">{selectedPlayers.length}</span> players
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fixed bottom action bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t-2 border-gray-200 p-6 shadow-2xl">
          <div className="max-w-4xl mx-auto flex justify-between items-center gap-6">
            <button
              onClick={() => setView('list')}
              className={`${getClasses('button')} bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-2xl shadow-lg`}
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={!name.trim() || selectedPlayers.length < 4}
              className={`${getClasses('button')} bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold rounded-2xl shadow-xl transform hover:scale-105 transition-all`}
            >
              Create Championship
            </button>
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100">
        <FontToggle />
        
        <div className="pt-20 pb-32 px-6">
          <div className="max-w-6xl mx-auto">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-10 gap-6">
              <div className="flex items-center">
                <button
                  onClick={() => setView('list')}
                  className={`${getClasses('button')} bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-2xl flex items-center space-x-4 mr-8 shadow-lg`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  <span>Back</span>
                </button>
                <div>
                  <h1 className={`${getClasses('heading')} font-bold text-gray-800`}>
                    {currentChampionship.name}
                  </h1>
                  <p className={`${getClasses('body')} text-gray-600 font-medium`}>
                    Started {new Date(currentChampionship.startDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <button
                onClick={startNewSession}
                className={`${getClasses('button')} bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-2xl shadow-2xl flex items-center space-x-4 transform hover:scale-105 transition-all`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                </svg>
                <span>Record Match</span>
              </button>
            </div>

            {/* Main Content */}
            <div className="bg-white/90 backdrop-blur rounded-3xl shadow-2xl overflow-hidden border border-gray-200">
              
              {/* Tabs */}
              <div className="flex bg-gray-50/80 border-b-2 border-gray-200">
                {[
                  { id: 'standings', label: 'Standings', icon: '🏆' },
                  { id: 'matches', label: 'Matches', icon: '🎾' },
                  { id: 'players', label: 'Players', icon: '👥' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 ${getClasses('button')} font-bold flex items-center justify-center space-x-3 transition-all border-b-4 ${
                      activeTab === tab.id 
                        ? 'border-blue-500 text-blue-600 bg-white shadow-lg' 
                        : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-3xl">{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="p-8">
                {activeTab === 'standings' && (
                  <div>
                    {currentChampionship.standings?.length === 0 ? (
                      <div className="text-center py-16">
                        <div className="text-8xl mb-6">🏆</div>
                        <h3 className={`${getClasses('heading')} font-bold text-gray-800 mb-4`}>
                          No Results Yet
                        </h3>
                        <p className={`${getClasses('body')} text-gray-600 mb-8`}>
                          Record some matches to see the standings
                        </p>
                        <button
                          onClick={startNewSession}
                          className={`${getClasses('button')} bg-green-600 hover:bg-green-700 text-white font-bold rounded-2xl shadow-lg transform hover:scale-105 transition-all`}
                        >
                          Record First Match
                        </button>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b-3 border-gray-200">
                              <th className={`text-left py-6 px-4 ${getClasses('body')} font-bold`}>Pos</th>
                              <th className={`text-left py-6 px-4 ${getClasses('body')} font-bold`}>Player</th>
                              <th className={`text-center py-6 px-4 ${getClasses('body')} font-bold`}>Points</th>
                              <th className={`text-center py-6 px-4 ${getClasses('body')} font-bold`}>Matches</th>
                              <th className={`text-center py-6 px-4 ${getClasses('body')} font-bold`}>Win %</th>
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
                                
                                return (
                                  <tr key={standing.playerId} className={`border-b border-gray-100 hover:bg-blue-50/50 transition-colors ${index < 3 ? 'bg-yellow-50/80' : ''}`}>
                                    <td className={`py-6 px-4 ${getClasses('body')} font-bold`}>
                                      <span className="text-4xl">
                                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
                                      </span>
                                    </td>
                                    <td className="py-6 px-4">
                                      <div className={`${getClasses('body')} font-bold text-gray-800`}>
                                        {player ? `${player.firstName} ${player.surname}` : 'Unknown'}
                                      </div>
                                      <div className={`${getClasses('small')} text-gray-600 mt-1`}>
                                        {player?.userId}
                                      </div>
                                    </td>
                                    <td className={`py-6 px-4 text-center ${getClasses('heading')} font-bold text-blue-600`}>
                                      {standing.points}
                                    </td>
                                    <td className={`py-6 px-4 text-center ${getClasses('body')} font-medium`}>
                                      {standing.matchesPlayed}
                                    </td>
                                    <td className={`py-6 px-4 text-center ${getClasses('body')} font-bold text-green-600`}>
                                      {winRate}%
                                    </td>
                                  </tr>
                                );
                              })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'matches' && (
                  <div>
                    {!currentChampionship.matches || currentChampionship.matches.length === 0 ? (
                      <div className="text-center py-16">
                        <div className="text-8xl mb-6">🎾</div>
                        <h3 className={`${getClasses('heading')} font-bold text-gray-800 mb-4`}>
                          No Matches Yet
                        </h3>
                        <p className={`${getClasses('body')} text-gray-600 mb-8`}>
                          Record your first match to get started
                        </p>
                        <button
                          onClick={startNewSession}
                          className={`${getClasses('button')} bg-green-600 hover:bg-green-700 text-white font-bold rounded-2xl shadow-lg transform hover:scale-105 transition-all`}
                        >
                          Record Match
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {currentChampionship.matches?.slice(-10).reverse().map((match) => (
                          <div key={match.id} className="p-6 border-2 border-gray-200 rounded-2xl hover:shadow-lg transition-all bg-white/60">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className={`${getClasses('body')} font-bold text-gray-800 mb-2`}>
                                  {match.teamA?.map(id => {
                                    const player = players.find(p => p.id === id);
                                    return player ? `${player.firstName} ${player.surname}` : 'Unknown';
                                  }).join(' & ')}
                                  <span className="mx-4 text-gray-400">vs</span>
                                  {match.teamB?.map(id => {
                                    const player = players.find(p => p.id === id);
                                    return player ? `${player.firstName} ${player.surname}` : 'Unknown';
                                  }).join(' & ')}
                                </div>
                                <div className={`${getClasses('small')} text-gray-600`}>
                                  {new Date(match.timestamp).toLocaleDateString()} • {new Date(match.timestamp).toLocaleTimeString()}
                                </div>
                              </div>
                              <div className={`${getClasses('heading')} font-bold text-blue-600 ml-6`}>
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
                        <div key={playerId} className="p-6 border-2 border-gray-200 rounded-2xl hover:shadow-lg transition-all bg-white/60">
                          <h4 className={`${getClasses('body')} font-bold text-gray-800 mb-2`}>
                            {player ? `${player.firstName} ${player.surname}` : 'Unknown'}
                          </h4>
                          <p className={`${getClasses('small')} text-gray-600 mb-4`}>{player?.userId}</p>
                          <div className={`${getClasses('small')} space-y-2`}>
                            <p className="font-medium">Points: <span className="font-bold text-blue-600">{standing?.points || 0}</span></p>
                            <p>Matches: {standing?.matchesPlayed || 0} ({winRate}% wins)</p>
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

  const SessionView = () => {
    const [selectedPlayers, setSelectedPlayers] = useState([]);

    const continueToMatches = () => {
      if (selectedPlayers.length < 4) {
        alert('Please select at least 4 players');
        return;
      }
      
      setCurrentSession({
        ...currentSession,
        attendees: selectedPlayers
      });
      setView('match');
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100">
        <FontToggle />
        
        <div className="pt-20 pb-40 px-6">
          <div className="max-w-5xl mx-auto">
            
            {/* Header */}
            <div className="flex items-center mb-10">
              <button
                onClick={() => setView('detail')}
                className={`${getClasses('button')} bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-2xl flex items-center space-x-4 mr-8 shadow-lg`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Back</span>
              </button>
              <div>
                <h1 className={`${getClasses('heading')} font-bold text-gray-800`}>Record Match</h1>
                <p className={`${getClasses('body')} text-gray-600 font-medium`}>
                  {currentChampionship.name} • {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="bg-white/90 backdrop-blur rounded-3xl shadow-2xl p-10 border border-gray-200">
              <h3 className={`${getClasses('heading')} font-bold text-gray-800 mb-6`}>Who's Playing?</h3>
              <p className={`${getClasses('body')} text-gray-600 mb-10 font-medium`}>Select players for this session</p>

              <div className="grid sm:grid-cols-2 gap-6 mb-12">
                {currentChampionship.players?.map((playerId) => {
                  const player = players.find(p => p.id === playerId);
                  const isSelected = selectedPlayers.includes(playerId);
                  
                  return (
                    <label
                      key={playerId}
                      className={`flex items-center space-x-6 p-6 rounded-2xl border-3 cursor-pointer transition-all transform hover:scale-105 ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-50 shadow-lg' 
                          : 'border-gray-200 hover:border-blue-300 hover:shadow-lg bg-white/50'
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
                        className="w-8 h-8 text-blue-600 rounded-lg"
                      />
                      <div>
                        <div className={`${getClasses('body')} font-bold text-gray-800`}>
                          {player ? `${player.firstName} ${player.surname}` : 'Unknown Player'}
                        </div>
                        <div className={`${getClasses('small')} text-gray-600 font-medium`}>{player?.userId}</div>
                      </div>
                    </label>
                  );
                })}
              </div>

              <div className="text-center">
                <p className={`${getClasses('body')} text-gray-600 font-medium mb-2`}>
                  Selected: <span className="font-bold text-blue-600">{selectedPlayers.length}</span> players 
                  <span className="text-gray-500"> (need 4 minimum)</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Fixed bottom action */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t-2 border-gray-200 p-6 shadow-2xl">
          <div className="max-w-5xl mx-auto text-center">
            <button
              onClick={continueToMatches}
              disabled={selectedPlayers.length < 4}
              className={`${getClasses('button')} bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold rounded-2xl shadow-xl transform hover:scale-105 transition-all`}
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
      
      // Reset for next match
      setTeamA([]);
      setTeamB([]);
      setScoreA('');
      setScoreB('');
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100">
        <FontToggle />
        
        <div className="pt-20 pb-40 px-6">
          <div className="max-w-6xl mx-auto">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-10 gap-6">
              <div className="flex items-center">
                <button
                  onClick={() => setView('session')}
                  className={`${getClasses('button')} bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-2xl flex items-center space-x-4 mr-8 shadow-lg`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  <span>Back</span>
                </button>
                <div>
                  <h1 className={`${getClasses('heading')} font-bold text-gray-800`}>Record Match</h1>
                  <p className={`${getClasses('body')} text-gray-600 font-medium`}>{new Date().toLocaleDateString()}</p>
                </div>
              </div>
              
              <button
                onClick={() => setView('detail')}
                className={`${getClasses('button')} bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg`}
              >
                Finish Session
              </button>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              
              {/* Team Formation */}
              <div className="bg-white/90 backdrop-blur rounded-3xl shadow-2xl p-8 border border-gray-200">
                <h3 className={`${getClasses('heading')} font-bold mb-8`}>Form Teams</h3>
                
                {/* Available Players */}
                <div className="mb-10">
                  <h4 className={`${getClasses('body')} font-bold text-gray-700 mb-6`}>Available Players</h4>
                  <p className={`${getClasses('small')} text-gray-600 mb-6 font-medium`}>Tap to assign to teams</p>
                  
                  <div className="grid gap-4">
                    {currentSession.attendees?.map((playerId) => {
                      const player = players.find(p => p.id === playerId);
                      const inTeamA = teamA.includes(playerId);
                      const inTeamB = teamB.includes(playerId);
                      const isAssigned = inTeamA || inTeamB;
                      
                      return (
                        <div
                          key={playerId}
                          className={`p-6 rounded-2xl border-3 text-center cursor-pointer transition-all transform hover:scale-105 ${
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
                              alert('Teams are full! Tap a player to remove them first.');
                            }
                          }}
                        >
                          <div className={`${getClasses('body')} font-bold mb-2`}>
                            {player ? `${player.firstName} ${player.surname}` : 'Unknown'}
                          </div>
                          {inTeamA && <div className={`${getClasses('small')} text-blue-600 font-bold`}>Team A</div>}
                          {inTeamB && <div className={`${getClasses('small')} text-green-600 font-bold`}>Team B</div>}
                          {!isAssigned && <div className={`${getClasses('small')} text-gray-500 font-medium`}>Tap to assign</div>}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Team Display */}
                <div className="grid grid-cols-2 gap-6 mb-10">
                  <div className="p-6 bg-blue-50 rounded-2xl border-3 border-blue-200">
                    <h4 className={`${getClasses('body')} font-bold text-blue-800 mb-4`}>
                      Team A ({teamA.length}/2)
                    </h4>
                    {teamA.map(playerId => {
                      const player = players.find(p => p.id === playerId);
                      return (
                        <div key={playerId} className={`${getClasses('small')} font-medium mb-2`}>
                          {player ? `${player.firstName} ${player.surname}` : 'Unknown'}
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="p-6 bg-green-50 rounded-2xl border-3 border-green-200">
                    <h4 className={`${getClasses('body')} font-bold text-green-800 mb-4`}>
                      Team B ({teamB.length}/2)
                    </h4>
                    {teamB.map(playerId => {
                      const player = players.find(p => p.id === playerId);
                      return (
                        <div key={playerId} className={`${getClasses('small')} font-medium mb-2`}>
                          {player ? `${player.firstName} ${player.surname}` : 'Unknown'}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Score Entry */}
                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div>
                    <label className={`block ${getClasses('body')} font-bold text-gray-700 mb-4`}>Team A Games</label>
                    <input
                      type="number"
                      value={scoreA}
                      onChange={(e) => setScoreA(e.target.value)}
                      className={`w-full ${getClasses('input')} border-3 border-gray-300 rounded-2xl text-center font-bold focus:border-blue-500 focus:ring-4 focus:ring-blue-200 bg-white/80`}
                      placeholder="0"
                      min="0"
                      max="20"
                    />
                  </div>
                  <div>
                    <label className={`block ${getClasses('body')} font-bold text-gray-700 mb-4`}>Team B Games</label>
                    <input
                      type="number"
                      value={scoreB}
                      onChange={(e) => setScoreB(e.target.value)}
                      className={`w-full ${getClasses('input')} border-3 border-gray-300 rounded-2xl text-center font-bold focus:border-green-500 focus:ring-4 focus:ring-green-200 bg-white/80`}
                      placeholder="0"
                      min="0"
                      max="20"
                    />
                  </div>
                </div>

                {/* Points Preview */}
                {scoreA && scoreB && (
                  <div className="mb-6 p-6 bg-yellow-50 border-3 border-yellow-200 rounded-2xl">
                    <h4 className={`${getClasses('body')} font-bold text-yellow-800 mb-3`}>Points Preview</h4>
                    <div className={`${getClasses('small')} text-yellow-700 font-medium`}>
                      {(() => {
                        const gamesA = parseInt(scoreA);
                        const gamesB = parseInt(scoreB);
                        const [pointsA, pointsB] = calculatePoints(gamesA, gamesB);
                        return `Team A: ${pointsA} points • Team B: ${pointsB} points`;
                      })()}
                    </div>
                  </div>
                )}
              </div>

              {/* Scoring Guide */}
              <div className="bg-white/90 backdrop-blur rounded-3xl shadow-2xl p-8 border border-gray-200">
                <h3 className={`${getClasses('heading')} font-bold mb-8`}>Scoring Guide</h3>
                
                <div className="space-y-6">
                  <div className="p-6 bg-green-50 border-3 border-green-200 rounded-2xl">
                    <h4 className={`${getClasses('body')} font-bold text-green-800 mb-2`}>Big Win (2+ games ahead)</h4>
                    <p className={`${getClasses('small')} text-green-700 font-medium mb-2`}>Winner: 3 points • Loser: 0 points</p>
                    <p className={`${getClasses('small')} text-green-600`}>Examples: 6-4, 6-3, 6-2</p>
                  </div>
                  
                  <div className="p-6 bg-blue-50 border-3 border-blue-200 rounded-2xl">
                    <h4 className={`${getClasses('body')} font-bold text-blue-800 mb-2`}>Close Win (1 game ahead)</h4>
                    <p className={`${getClasses('small')} text-blue-700 font-medium mb-2`}>Winner: 2 points • Loser: 0 points</p>
                    <p className={`${getClasses('small')} text-blue-600`}>Examples: 6-5, 7-6</p>
                  </div>
                  
                  <div className="p-6 bg-purple-50 border-3 border-purple-200 rounded-2xl">
                    <h4 className={`${getClasses('body')} font-bold text-purple-800 mb-2`}>Draw (same games)</h4>
                    <p className={`${getClasses('small')} text-purple-700 font-medium mb-2`}>Both teams: 1 point each</p>
                    <p className={`${getClasses('small')} text-purple-600`}>Examples: 6-6, 5-5</p>
                  </div>
                </div>

                <div className="mt-8 p-6 bg-gray-50 border-3 border-gray-200 rounded-2xl">
                  <h4 className={`${getClasses('body')} font-bold text-gray-800 mb-4`}>Quick Tips</h4>
                  <ul className={`${getClasses('small')} text-gray-700 space-y-3 font-medium`}>
                    <li>• Tap players to assign to teams</li>
                    <li>• Each team needs exactly 2 players</li>
                    <li>• Enter final game scores</li>
                    <li>• Points calculated automatically</li>
                    <li>• Record multiple matches per session</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fixed bottom action */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t-3 border-gray-200 p-6 shadow-2xl">
          <div className="max-w-6xl mx-auto text-center">
            <button
              onClick={recordMatch}
              disabled={teamA.length !== 2 || teamB.length !== 2 || !scoreA || !scoreB}
              className={`${getClasses('button')} bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold rounded-2xl shadow-xl transform hover:scale-105 transition-all`}
            >
              Record Match
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Main render
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