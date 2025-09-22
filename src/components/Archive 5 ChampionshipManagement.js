import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const ChampionshipManagement = ({ saveLastUsed }) => {
  const [view, setView] = useState('list');
  const [championships, setChampionships] = useState([]);
  const [currentChampionship, setCurrentChampionship] = useState(null);
  const [currentSession, setCurrentSession] = useState(null);
  const [players, setPlayers] = useState([]);
  const [fontSize, setFontSize] = useState('large');
  const [showAddPlayersModal, setShowAddPlayersModal] = useState(false);
  
  // Form states - must be at top level
  const [name, setName] = useState('');
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [activeTab, setActiveTab] = useState('standings');

  // Load font preference
  useEffect(() => {
    const savedFontSize = localStorage.getItem('padelFontSize') || 'large';
    setFontSize(savedFontSize);
  }, []);

  // Save font preference
  useEffect(() => {
    localStorage.setItem('padelFontSize', fontSize);
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

  const FontToggle = () => (
    <div className="fixed bottom-6 right-6 z-50 bg-white/95 backdrop-blur rounded-2xl shadow-2xl border border-gray-200 p-3">
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
    
    // Reset form
    setName('');
    setSelectedPlayers([]);
  };

  if (view === 'list') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100">
        <FontToggle />
        
        {/* Back to Home Button */}
        <div className="pt-6 px-6">
          <Link 
            to="/"
            className={`${getClasses('button')} bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-2xl flex items-center space-x-4 shadow-lg inline-flex`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Home</span>
          </Link>
        </div>
        
        <div className="pt-14 pb-32 px-6">
          <div className="max-w-4xl mx-auto">
            
            <div className="text-center mb-12">
              <h1 className={`${getClasses('title')} font-black bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 bg-clip-text text-transparent mb-6`}>
                Championships
              </h1>
              <p className={`${getClasses('body')} text-gray-600 font-medium`}>
                Professional Padel Tournament Management
              </p>
            </div>

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
  }

  if (view === 'create') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100">
        <FontToggle />
        
        <div className="pt-20 pb-40 px-6">
          <div className="max-w-4xl mx-auto">
            
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

            <div className="bg-white/90 backdrop-blur rounded-3xl shadow-2xl p-10 border border-gray-200">
              <div className="space-y-10">
                
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
                          Add players in Player Management first
                        </p>
                        <Link 
                          to="/players"
                          className={`${getClasses('button')} bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg transform hover:scale-105 transition-all inline-flex items-center space-x-3 mt-6`}
                        >
                          <span>Go to Player Management</span>
                        </Link>
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
  }

  if (view === 'detail') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100">
        <FontToggle />
        
        <div className="pt-20 pb-32 px-6">
          <div className="max-w-6xl mx-auto">
            
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
                onClick={() => setView('session')}
                className={`${getClasses('button')} bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-2xl shadow-2xl flex items-center space-x-4 transform hover:scale-105 transition-all`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                </svg>
                <span>Record Match</span>
              </button>
            </div>

            <div className="bg-white/90 backdrop-blur rounded-3xl shadow-2xl overflow-hidden border border-gray-200">
              
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

              <div className="p-8">
                {activeTab === 'standings' && (
                  <div>
                    <h3 className={`${getClasses('heading')} font-bold text-gray-800 mb-8`}>
                      Championship Standings
                    </h3>
                    
                    {(!currentChampionship.standings || currentChampionship.standings.length === 0) ? (
                      <div className="text-center py-16">
                        <div className="text-8xl mb-6">🏆</div>
                        <h3 className={`${getClasses('heading')} font-bold text-gray-800 mb-4`}>
                          No Matches Played Yet
                        </h3>
                        <p className={`${getClasses('body')} text-gray-600 mb-8`}>
                          Record your first match to see standings
                        </p>
                        <button
                          onClick={() => setView('session')}
                          className={`${getClasses('button')} bg-green-600 hover:bg-green-700 text-white font-bold rounded-2xl shadow-lg`}
                        >
                          Record First Match
                        </button>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-gray-300">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="border border-gray-300 px-4 py-3 text-left font-bold">Pos</th>
                              <th className="border border-gray-300 px-4 py-3 text-left font-bold">Player</th>
                              <th className="border border-gray-300 px-4 py-3 text-center font-bold">Points</th>
                              <th className="border border-gray-300 px-4 py-3 text-center font-bold">Matches</th>
                              <th className="border border-gray-300 px-4 py-3 text-center font-bold">Won</th>
                            </tr>
                          </thead>
                          <tbody>
                            {currentChampionship.standings
                              .sort((a, b) => b.points - a.points)
                              .map((standing, index) => {
                                const player = players.find(p => p.id === standing.playerId);
                                return (
                                  <tr key={standing.playerId} className={index === 0 ? 'bg-yellow-50' : 'hover:bg-gray-50'}>
                                    <td className="border border-gray-300 px-4 py-3 text-center font-bold">
                                      {index + 1}
                                    </td>
                                    <td className="border border-gray-300 px-4 py-3">
                                      <span className={`${getClasses('body')} font-bold`}>
                                        {player ? `${player.firstName} ${player.surname}` : 'Unknown Player'}
                                      </span>
                                    </td>
                                    <td className="border border-gray-300 px-4 py-3 text-center">
                                      <span className={`${getClasses('body')} font-bold text-blue-600`}>
                                        {standing.points}
                                      </span>
                                    </td>
                                    <td className="border border-gray-300 px-4 py-3 text-center">
                                      {standing.matchesPlayed}
                                    </td>
                                    <td className="border border-gray-300 px-4 py-3 text-center">
                                      {standing.matchesWon}
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
                    <h3 className={`${getClasses('heading')} font-bold text-gray-800 mb-8`}>
                      Match History
                    </h3>
                    
                    {(!currentChampionship.matches || currentChampionship.matches.length === 0) ? (
                      <div className="text-center py-16">
                        <div className="text-8xl mb-6">🎾</div>
                        <h3 className={`${getClasses('heading')} font-bold text-gray-800 mb-4`}>
                          No Matches Recorded
                        </h3>
                        <p className={`${getClasses('body')} text-gray-600 mb-8`}>
                          Start recording matches to build your championship history
                        </p>
                        <button
                          onClick={() => setView('session')}
                          className={`${getClasses('button')} bg-green-600 hover:bg-green-700 text-white font-bold rounded-2xl shadow-lg`}
                        >
                          Record Match
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {currentChampionship.matches.map((match, index) => (
                          <div key={index} className="p-6 border-2 border-gray-200 rounded-2xl bg-white/60">
                            <p className={`${getClasses('body')} font-bold text-gray-800`}>
                              Match {index + 1} - {new Date(match.date).toLocaleDateString()}
                            </p>
                            {/* Match details would go here */}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'players' && (
                  <div>
                    <div className="flex justify-between items-center mb-8">
                      <h3 className={`${getClasses('heading')} font-bold text-gray-800`}>
                        Championship Players ({currentChampionship.players?.length || 0})
                      </h3>
                      <button
                        onClick={() => setShowAddPlayersModal(true)}
                        className={`${getClasses('button')} bg-green-600 hover:bg-green-700 text-white font-bold rounded-2xl shadow-lg transform hover:scale-105 transition-all flex items-center space-x-3`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span>Add Players</span>
                      </button>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {currentChampionship.players?.map((playerId) => {
                        const player = players.find(p => p.id === playerId);
                        const standing = currentChampionship.standings?.find(s => s.playerId === playerId);
                        
                        return (
                          <div key={playerId} className="p-6 border-2 border-gray-200 rounded-2xl hover:shadow-lg transition-all bg-white/60">
                            <h4 className={`${getClasses('body')} font-bold text-gray-800 mb-2`}>
                              {player ? `${player.firstName} ${player.surname}` : 'Unknown'}
                            </h4>
                            <p className={`${getClasses('small')} text-gray-600 mb-4`}>{player?.userId}</p>
                            {standing && (
                              <div className="space-y-2">
                                <p className={`${getClasses('small')} text-gray-600`}>
                                  <span className="font-bold text-blue-600">{standing.points}</span> points
                                </p>
                                <p className={`${getClasses('small')} text-gray-600`}>
                                  {standing.matchesWon}/{standing.matchesPlayed} matches won
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {(!currentChampionship.players || currentChampionship.players.length === 0) && (
                      <div className="text-center py-16">
                        <div className="text-8xl mb-6">👥</div>
                        <h3 className={`${getClasses('heading')} font-bold text-gray-800 mb-4`}>
                          No Players Added
                        </h3>
                        <p className={`${getClasses('body')} text-gray-600 mb-8`}>
                          Add some players to get started with this championship
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'session') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100">
        <FontToggle />
        
        <div className="pt-20 pb-32 px-6">
          <div className="max-w-4xl mx-auto">
            
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
              <h1 className={`${getClasses('heading')} font-bold text-gray-800`}>
                Record Match - {currentChampionship.name}
              </h1>
            </div>

            <div className="bg-white/90 backdrop-blur rounded-3xl shadow-2xl p-10 border border-gray-200 text-center">
              <div className="text-8xl mb-6">🚧</div>
              <h3 className={`${getClasses('heading')} font-bold text-gray-800 mb-4`}>
                Match Recording Coming Soon
              </h3>
              <p className={`${getClasses('body')} text-gray-600 mb-8`}>
                The match recording interface is being developed. This will allow you to:
              </p>
              <ul className={`${getClasses('body')} text-gray-600 text-left max-w-2xl mx-auto space-y-3 mb-8`}>
                <li>• Select players for each match</li>
                <li>• Record set scores</li>
                <li>• Calculate championship points automatically</li>
                <li>• Update standings in real-time</li>
              </ul>
              <button
                onClick={() => setView('detail')}
                className={`${getClasses('button')} bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg`}
              >
                Back to Championship
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default view - should always return something
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100">
      <FontToggle />
      <div className="pt-20 pb-32 px-6">
        <div className="max-w-4xl mx-auto">
          <p className={`${getClasses('body')} text-gray-600`}>Loading...</p>
        </div>
      </div>
    </div>
  );
};

export default ChampionshipManagement;
                