
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlayerManagementModal, PlayerManagementUtils } from './PlayerManagementComponent';

const ChampionshipManagement = ({ saveLastUsed }) => {
  // Main view states
  const [view, setView] = useState('list');
  const [championships, setChampionships] = useState([]);
  const [currentChampionship, setCurrentChampionship] = useState(null);
  const [players, setPlayers] = useState([]);
  const [fontSize, setFontSize] = useState('large');

  // Form states
  const [name, setName] = useState('');
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [activeTab, setActiveTab] = useState('standings');

  // Modal states
const [showAddPlayersModal, setShowAddPlayersModal] = useState(false);
const [showAddNewPlayerModal, setShowAddNewPlayerModal] = useState(false);
const [showScoringModal, setShowScoringModal] = useState(false);
const [showChampionshipSettings, setShowChampionshipSettings] = useState(false);

  // Session/Match recording states
  const [sessionStep, setSessionStep] = useState('setup'); // 'setup', 'recording', 'complete'
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendingPlayers, setAttendingPlayers] = useState([]);
  const [sessionMatches, setSessionMatches] = useState([]);
  const [teamA, setTeamA] = useState([]);
  const [teamB, setTeamB] = useState([]);
  const [setScores, setSetScores] = useState({ teamA: '', teamB: '' });
  const [editingMatchDate, setEditingMatchDate] = useState(null);

  // Load preferences and data on mount
  useEffect(() => {
    const savedFontSize = localStorage.getItem('padelFontSize') || 'large';
    setFontSize(savedFontSize);
    loadChampionships();
    loadPlayers();
  }, []);

  // Save font preference
  useEffect(() => {
    localStorage.setItem('padelFontSize', fontSize);
    document.documentElement.setAttribute('data-font-size', fontSize);
  }, [fontSize]);

  // Debug effects
  useEffect(() => {
    console.log('Players array updated:', players.length, 'players');
    console.log('Active players:', players.filter(p => p.isActive).length);
    players.forEach(p => console.log(`- ${p.firstName} ${p.surname} (${p.userId}) - Active: ${p.isActive}`));
  }, [players]);

  useEffect(() => {
    if (activeTab === 'players' && view === 'detail') {
      console.log('Players tab activated, refreshing player data...');
      refreshPlayers();
    }
  }, [activeTab, view]);

  // Listen for localStorage changes
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'padelTournamentPlayers') {
        console.log('Players updated in another tab, refreshing...');
        loadPlayers();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Data loading functions
  const loadChampionships = () => {
    const saved = localStorage.getItem('padelChampionships');
    if (saved) {
      try {
        setChampionships(JSON.parse(saved));
      } catch (error) {
        console.error('Error parsing championships:', error);
        setChampionships([]);
      }
    }
  };

  const saveChampionships = (data) => {
    localStorage.setItem('padelChampionships', JSON.stringify(data));
    setChampionships(data);
  };

  const loadPlayers = () => {
    const saved = localStorage.getItem('padelTournamentPlayers');
    if (saved) {
      try {
        const parsedPlayers = JSON.parse(saved);
        console.log('Loaded players:', parsedPlayers);
        setPlayers(parsedPlayers);
      } catch (error) {
        console.error('Error parsing players:', error);
        setPlayers([]);
      }
    } else {
      console.log('No players found in localStorage');
      setPlayers([]);
    }
  };

  const refreshPlayers = () => {
    loadPlayers();
    loadChampionships();
  };

  // Player management functions
  const handleAddNewPlayer = (newPlayerData) => {
    const newPlayer = {
      id: Date.now().toString(),
      ...newPlayerData,
      totalTournaments: 0,
      totalPoints: 0,
      gamesWon: 0,
      gamesLost: 0,
      gameDifferential: 0
    };

    const updatedPlayers = [...players, newPlayer];
    setPlayers(updatedPlayers);
    PlayerManagementUtils.savePlayers(updatedPlayers);

    console.log('Added new player:', newPlayer);
    setShowAddNewPlayerModal(false);
  };

  const handleUpdatePlayer = (updatedPlayer) => {
    const updatedPlayers = players.map(p =>
      p.id === updatedPlayer.id ? updatedPlayer : p
    );
    setPlayers(updatedPlayers);
    PlayerManagementUtils.savePlayers(updatedPlayers);
  };

  const handleDeletePlayer = (playerId) => {
    if (window.confirm('Are you sure you want to delete this player? This will remove them from all championships.')) {
      const updatedPlayers = players.filter(p => p.id !== playerId);
      setPlayers(updatedPlayers);
      PlayerManagementUtils.savePlayers(updatedPlayers);

      // Remove from championships
      const updatedChampionships = championships.map(championship => ({
        ...championship,
        players: championship.players.filter(pId => pId !== playerId),
        standings: championship.standings.filter(s => s.playerId !== playerId)
      }));

      saveChampionships(updatedChampionships);
    }
  };

  // Championship player management
  const addPlayerToChampionship = (playerId) => {
    if (!currentChampionship.players.includes(playerId)) {
      const updatedChampionship = {
        ...currentChampionship,
        players: [...currentChampionship.players, playerId],
        standings: [
          ...currentChampionship.standings,
          {
            playerId,
            points: 0,
            matchesPlayed: 0,
            matchesWon: 0,
            setsWon: 0,
            setsLost: 0,
            gamesWon: 0,
            gamesLost: 0,
            setsPlayed: 0
          }
        ]
      };

      setCurrentChampionship(updatedChampionship);

      const updatedChampionships = championships.map(c =>
        c.id === currentChampionship.id ? updatedChampionship : c
      );
      saveChampionships(updatedChampionships);
    }
  };

  const removePlayerFromChampionship = (playerId) => {
    if (window.confirm('Remove this player from the championship? Their match history will be preserved but they won\'t participate in new matches.')) {
      const updatedChampionship = {
        ...currentChampionship,
        players: currentChampionship.players.filter(pId => pId !== playerId),
        standings: currentChampionship.standings.filter(s => s.playerId !== playerId)
      };

      setCurrentChampionship(updatedChampionship);

      const updatedChampionships = championships.map(c =>
        c.id === currentChampionship.id ? updatedChampionship : c
      );
      saveChampionships(updatedChampionships);
    }
  };

  // CJ Scoring System
  const calculateCJPoints = (scoreA, scoreB) => {
    const gamesA = parseInt(scoreA) || 0;
    const gamesB = parseInt(scoreB) || 0;

    if (gamesA === 0 && gamesB === 0) return [0, 0];

    const diff = gamesA - gamesB;
    const totalGames = gamesA + gamesB;

    // Minimum 4 games for points
    if (totalGames < 4) return [0, 0];

    if (diff >= 2) {
      // Win by 2+ games
      if (gamesA >= 6 && diff >= 3) return [5, 1]; // Big win vs standard loss
      if (gamesA >= 6) return [4, 2]; // Win with games vs close loss
      return [2, 1]; // Leading by 2+ vs losing (incomplete)
    } else if (diff === 1) {
      if (gamesA >= 6) return [4, 2]; // Win with games vs close loss
      return [2, 1]; // Leading by 1 vs losing (incomplete)
    } else if (diff === 0) {
      return [1, 1]; // Draw
    } else if (diff === -1) {
      if (gamesB >= 6) return [2, 4]; // Close loss vs win with games
      return [1, 2]; // Losing vs leading by 1 (incomplete)
    } else {
      // Loss by 2+ games
      if (gamesB >= 6 && diff <= -3) return [1, 5]; // Standard loss vs big win
      if (gamesB >= 6) return [2, 4]; // Close loss vs win with games
      return [1, 2]; // Losing vs leading by 2+ (incomplete)
    }
  };

  // Match management functions
  const saveMatch = (match) => {
    const newMatches = [...sessionMatches, match];
    setSessionMatches(newMatches);

    // Update championship standings
    const updatedStandings = [...currentChampionship.standings];

    // Update stats for all players in the match
    [...match.teamA, ...match.teamB].forEach(playerId => {
      const standingIndex = updatedStandings.findIndex(s => s.playerId === playerId);
      if (standingIndex !== -1) {
        const standing = updatedStandings[standingIndex];
        const isTeamA = match.teamA.includes(playerId);
        const playerPoints = isTeamA ? match.points.teamA : match.points.teamB;

        standing.points += playerPoints;
        standing.matchesPlayed += 1;
        if ((isTeamA && match.points.teamA > match.points.teamB) ||
          (!isTeamA && match.points.teamB > match.points.teamA)) {
          standing.matchesWon += 1;
        }
        standing.setsPlayed = (standing.setsPlayed || 0) + 1;
        standing.gamesWon = (standing.gamesWon || 0) + (isTeamA ? match.gamesA : match.gamesB);
        standing.gamesLost = (standing.gamesLost || 0) + (isTeamA ? match.gamesB : match.gamesA);
      }
    });

    // Save updated championship
    const updatedChampionship = {
      ...currentChampionship,
      standings: updatedStandings,
      matches: [...(currentChampionship.matches || []), match]
    };

    const updatedChampionships = championships.map(c =>
      c.id === currentChampionship.id ? updatedChampionship : c
    );

    saveChampionships(updatedChampionships);
    setCurrentChampionship(updatedChampionship);
  };

  const handleScoreSubmit = () => {
    if (!teamA.length || !teamB.length || !setScores.teamA || !setScores.teamB) {
      alert('Please select teams and enter scores');
      return;
    }

    const gamesA = parseInt(setScores.teamA) || 0;
    const gamesB = parseInt(setScores.teamB) || 0;
    const [pointsA, pointsB] = calculateCJPoints(gamesA, gamesB);

    const match = {
      id: Date.now(),
      date: sessionDate,
      teamA: [...teamA],
      teamB: [...teamB],
      gamesA,
      gamesB,
      points: { teamA: pointsA, teamB: pointsB },
      timestamp: new Date().toISOString()
    };

    saveMatch(match);

    // Reset for next match
    setTeamA([]);
    setTeamB([]);
    setSetScores({ teamA: '', teamB: '' });
  };

  const updateMatchDate = (matchId, newDate) => {
    const updatedMatches = currentChampionship.matches.map(match =>
      match.id === matchId ? { ...match, date: newDate } : match
    );

    const updatedChampionship = {
      ...currentChampionship,
      matches: updatedMatches
    };

    const updatedChampionships = championships.map(c =>
      c.id === currentChampionship.id ? updatedChampionship : c
    );

    saveChampionships(updatedChampionships);
    setCurrentChampionship(updatedChampionship);
    setEditingMatchDate(null);
  };

  const getPlayerName = (playerId) => {
    const player = players.find(p => p.id === playerId);
    return player ? `${player.firstName} ${player.surname}` : 'Unknown';
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
        gamesLost: 0,
        setsPlayed: 0
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

  // UI Components
  const FontToggle = () => (
    <div className="fixed bottom-6 right-6 z-50 bg-white/95 backdrop-blur rounded-2xl shadow-2xl border border-gray-200 p-3">
      <div className="flex items-center space-x-3">
        <span className={`${fontSize === 'small' ? 'text-gray-400' : 'text-gray-600'} font-medium`}>A</span>
        <button
          onClick={() => setFontSize(fontSize === 'small' ? 'large' : 'small')}
          className={`relative inline-flex h-10 w-16 items-center rounded-full transition-all duration-300 ${fontSize === 'large' ? 'bg-gradient-to-r from-blue-500 to-purple-600' : 'bg-gray-300'
            }`}
        >
          <span
            className={`inline-block h-8 w-8 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${fontSize === 'large' ? 'translate-x-7' : 'translate-x-1'
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

  const DebugInfo = () => {
    if (process.env.NODE_ENV === 'production') return null;

    return (
      <div className="fixed top-0 left-0 bg-black/80 text-white p-2 text-xs z-50 max-w-xs">
        <div>View: {view}</div>
        <div>Tab: {activeTab}</div>
        <div>Players: {players.length}</div>
        <div>Active: {players.filter(p => p.isActive).length}</div>
        <div>Champ Players: {currentChampionship?.players?.length || 0}</div>
        <div>LocalStorage Players: {localStorage.getItem('padelTournamentPlayers') ? JSON.parse(localStorage.getItem('padelTournamentPlayers')).length : 0}</div>
      </div>
    );
  };

  const ScoringSystemModal = () => {
    if (!showScoringModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-96 overflow-y-auto border border-gray-200">
          <div className="p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className={`${getClasses('heading')} font-bold text-gray-800`}>
                CJ Championship Scoring System
              </h3>
              <button
                onClick={() => setShowScoringModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className={`${getClasses('body')} font-bold text-blue-600 mb-4`}>Completed Sets (6+ games to winner)</h4>
                <div className="space-y-3">
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className={`${getClasses('small')} font-bold text-green-700`}>Big Win: 5 points</p>
                    <p className={`${getClasses('small')} text-gray-600`}>Win 6-3 or better (margin 3+)</p>
                  </div>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className={`${getClasses('small')} font-bold text-blue-700`}>Win with Games: 4 points</p>
                    <p className={`${getClasses('small')} text-gray-600`}>Win 6-4, 6-5 (margin 1-2)</p>
                  </div>
                  <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <p className={`${getClasses('small')} font-bold text-purple-700`}>Tiebreak Win: 3 points</p>
                    <p className={`${getClasses('small')} text-gray-600`}>Win 7-6 (tiebreak victory)</p>
                  </div>
                </div>

                <h5 className={`${getClasses('small')} font-bold text-gray-700 mt-6 mb-3`}>Losing Points</h5>
                <div className="space-y-2">
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className={`${getClasses('small')} font-bold text-orange-700`}>Close Loss: 2 points</p>
                    <p className={`${getClasses('small')} text-gray-600`}>Lose 4-6, 5-6, 6-7</p>
                  </div>
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className={`${getClasses('small')} font-bold text-red-700`}>Standard Loss: 1 point</p>
                    <p className={`${getClasses('small')} text-gray-600`}>Lose 3-6 or worse</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className={`${getClasses('body')} font-bold text-amber-600 mb-4`}>Incomplete Sets (4+ games minimum)</h4>
                <div className="space-y-3">
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className={`${getClasses('small')} font-bold text-green-700`}>Leading by 2+: 2 points</p>
                    <p className={`${getClasses('small')} text-gray-600`}>e.g., 4-2, 5-3</p>
                  </div>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className={`${getClasses('small')} font-bold text-blue-700`}>Leading by 1: 2 points</p>
                    <p className={`${getClasses('small')} text-gray-600`}>e.g., 4-3, 5-4</p>
                  </div>
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className={`${getClasses('small')} font-bold text-yellow-700`}>Draw: 1 point each</p>
                    <p className={`${getClasses('small')} text-gray-600`}>e.g., 4-4, 5-5</p>
                  </div>
                </div>

                <h5 className={`${getClasses('small')} font-bold text-gray-700 mt-6 mb-3`}>Losing (Incomplete)</h5>
                <div className="space-y-2">
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className={`${getClasses('small')} font-bold text-orange-700`}>Behind by 1: 1 point</p>
                    <p className={`${getClasses('small')} text-gray-600`}>e.g., 3-4, 4-5</p>
                  </div>
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className={`${getClasses('small')} font-bold text-red-700`}>Behind by 2+: 1 point</p>
                    <p className={`${getClasses('small')} text-gray-600`}>e.g., 2-4, 3-5</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className={`${getClasses('small')} text-blue-700 font-medium`}>
                <strong>Note:</strong> Minimum 4 total games required for any points to be awarded.
                The system encourages competitive play while rewarding strong performances.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // MAIN RENDER VIEWS
  if (view === 'list') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100">
        <FontToggle />
        <DebugInfo />

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
        <DebugInfo />

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
                            className={`flex items-center space-x-6 p-6 hover:bg-blue-50 rounded-2xl cursor-pointer transition-all border-2 ${selectedPlayers.includes(player.id) ? 'bg-blue-50 border-blue-300' : 'border-transparent hover:border-blue-200'
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
        <DebugInfo />

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
                <div className="flex-1">
                  <div className="flex items-center space-x-4">
                    <div>
                      <h1 className={`${getClasses('heading')} font-bold text-gray-800`}>
                        {currentChampionship.name}
                      </h1>
                      <p className={`${getClasses('body')} text-gray-600 font-medium`}>
                        Started {new Date(currentChampionship.startDate).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => setShowChampionshipSettings(true)}
                      className="p-3 hover:bg-gray-100 rounded-full transition-colors"
                      title="Championship Settings"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setView('session');
                  setSessionStep('setup');
                  setSessionDate(new Date().toISOString().split('T')[0]);
                  setAttendingPlayers([]);
                  setSessionMatches([]);
                }}
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
                    className={`flex-1 ${getClasses('small')} font-bold flex items-center justify-center space-x-2 transition-all border-b-4 ${activeTab === tab.id
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
                              <th className="border border-gray-300 px-4 py-3 text-center font-bold">Games +/-</th>
                            </tr>
                          </thead>
                          <tbody>
                            {currentChampionship.standings
                              .sort((a, b) => b.points - a.points)
                              .map((standing, index) => {
                                const player = players.find(p => p.id === standing.playerId);
                                const gameDiff = (standing.gamesWon || 0) - (standing.gamesLost || 0);
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
                                    <td className="border border-gray-300 px-4 py-3 text-center">
                                      <span className={gameDiff >= 0 ? 'text-green-600' : 'text-red-600'}>
                                        {gameDiff >= 0 ? '+' : ''}{gameDiff}
                                      </span>
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
                          <div key={match.id || index} className="p-6 border-2 border-gray-200 rounded-2xl bg-white/60">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                              <div className="text-center">
                                <p className={`${getClasses('small')} font-bold text-blue-600`}>Team A</p>
                                <p className={`${getClasses('small')} text-gray-700`}>
                                  {match.teamA?.map(id => getPlayerName(id)).join(' & ')}
                                </p>
                              </div>
                              <div className="text-center">
                                <p className={`${getClasses('body')} font-bold`}>
                                  {match.gamesA} - {match.gamesB}
                                </p>
                                <p className={`${getClasses('small')} text-gray-500`}>
                                  {match.points?.teamA} - {match.points?.teamB} pts
                                </p>
                              </div>
                              <div className="text-center">
                                <p className={`${getClasses('small')} font-bold text-green-600`}>Team B</p>
                                <p className={`${getClasses('small')} text-gray-700`}>
                                  {match.teamB?.map(id => getPlayerName(id)).join(' & ')}
                                </p>
                              </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                              {editingMatchDate === match.id ? (
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="date"
                                    defaultValue={match.date}
                                    onBlur={(e) => updateMatchDate(match.id, e.target.value)}
                                    onKeyPress={(e) => {
                                      if (e.key === 'Enter') {
                                        updateMatchDate(match.id, e.target.value);
                                      }
                                    }}
                                    className="px-2 py-1 border rounded text-sm"
                                    autoFocus
                                  />
                                  <button
                                    onClick={() => setEditingMatchDate(null)}
                                    className="text-gray-500 hover:text-gray-700"
                                  >
                                    ✕
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setEditingMatchDate(match.id)}
                                  className={`${getClasses('small')} text-gray-500 hover:text-gray-700 flex items-center space-x-1`}
                                >
                                  <span>{new Date(match.date).toLocaleDateString()}</span>
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                              )}
                              <span className={`${getClasses('small')} text-gray-400`}>
                                Match {index + 1}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'players' && (
                  <div>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
                      <h3 className={`${getClasses('heading')} font-bold text-gray-800`}>
                        Championship Players ({currentChampionship.players?.length || 0})
                      </h3>
                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={() => setShowAddNewPlayerModal(true)}
                          className={`${getClasses('button')} bg-green-600 hover:bg-green-700 text-white font-bold rounded-2xl shadow-lg transform hover:scale-105 transition-all flex items-center space-x-3`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          <span>Add New Player</span>
                        </button>
                        <button
                          onClick={() => setShowAddPlayersModal(true)}
                          className={`${getClasses('button')} bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg transform hover:scale-105 transition-all flex items-center space-x-3`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                          </svg>
                          <span>Add Existing Players</span>
                        </button>
                        <button
                          onClick={refreshPlayers}
                          className={`${getClasses('button')} bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl shadow-lg transform hover:scale-105 transition-all flex items-center space-x-3`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          <span>Refresh</span>
                        </button>
                      </div>
                    </div>

                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className={`${getClasses('small')} text-yellow-700`}>
                        <strong>Debug:</strong> Total players in database: {players.length} |
                        Active players: {players.filter(p => p.isActive).length} |
                        Championship players: {currentChampionship.players?.length || 0}
                      </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                      {currentChampionship.players?.map((playerId) => {
                        const player = players.find(p => p.id === playerId);
                        const standing = currentChampionship.standings?.find(s => s.playerId === playerId);

                        return (
                          <div key={playerId} className="p-6 border-2 border-gray-200 rounded-2xl hover:shadow-lg transition-all bg-white/60 relative">
                            <button
                              onClick={() => removePlayerFromChampionship(playerId)}
                              className="absolute top-2 right-2 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
                              title="Remove from championship"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>

                            <h4 className={`${getClasses('body')} font-bold text-gray-800 mb-2 pr-8`}>
                              {player ? `${player.firstName} ${player.surname}` : 'Unknown Player'}
                            </h4>
                            <p className={`${getClasses('small')} text-gray-600 mb-4`}>
                              {player?.userId || 'No ID'}
                            </p>
                            {standing && (
                              <div className="space-y-2">
                                <p className={`${getClasses('small')} text-gray-600`}>
                                  <span className="font-bold text-blue-600">{standing.points}</span> points
                                </p>
                                <p className={`${getClasses('small')} text-gray-600`}>
                                  {standing.matchesWon}/{standing.matchesPlayed} matches won
                                </p>
                                <p className={`${getClasses('small')} text-gray-600`}>
                                  {standing.gamesWon || 0}/{(standing.gamesWon || 0) + (standing.gamesLost || 0)} games
                                </p>
                              </div>
                            )}
                            {!player && (
                              <p className={`${getClasses('small')} text-red-500`}>
                                Player data not found - may have been deleted
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {players.filter(p => p.isActive && !currentChampionship.players.includes(p.id)).length > 0 && (
                      <div>
                        <h4 className={`${getClasses('body')} font-bold text-gray-800 mb-4`}>
                          Available Players ({players.filter(p => p.isActive && !currentChampionship.players.includes(p.id)).length})
                        </h4>
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                          {players
                            .filter(p => p.isActive && !currentChampionship.players.includes(p.id))
                            .map((player) => (
                              <div key={player.id} className="p-4 border border-gray-200 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                                <h5 className={`${getClasses('small')} font-bold text-gray-800 mb-2`}>
                                  {player.firstName} {player.surname}
                                </h5>
                                <p className={`${getClasses('small')} text-gray-600 mb-3`}>
                                  {player.userId}
                                </p>
                                <button
                                  onClick={() => addPlayerToChampionship(player.id)}
                                  className="w-full py-2 px-3 text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                                >
                                  Add to Championship
                                </button>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                    {(!currentChampionship.players || currentChampionship.players.length === 0) && (
                      <div className="text-center py-16">
                        <div className="text-8xl mb-6">👥</div>
                        <h3 className={`${getClasses('heading')} font-bold text-gray-800 mb-4`}>
                          No Players Added
                        </h3>
                        <p className={`${getClasses('body')} text-gray-600 mb-8`}>
                          Add players to get started with this championship
                        </p>
                      </div>
                    )}

                    {players.filter(p => p.isActive).length === 0 && (
                      <div className="mt-8 p-6 bg-amber-50 border border-amber-200 rounded-2xl">
                        <h4 className={`${getClasses('body')} font-bold text-amber-700 mb-2`}>
                          No Active Players Found
                        </h4>
                        <p className={`${getClasses('small')} text-amber-600 mb-4`}>
                          You need to add some players to the system first.
                        </p>
                        <div className="flex gap-3">
                          <button
                            onClick={() => setShowAddNewPlayerModal(true)}
                            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg"
                          >
                            Add First Player
                          </button>
                          <Link
                            to="/players"
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg"
                          >
                            Go to Player Management
                          </Link>
                        </div>
                      </div>
                    )}

                    {/* Add Existing Players Modal */}
                    {showAddPlayersModal && (
                      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-96 overflow-y-auto border border-gray-200">
                          <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                              <h3 className={`${getClasses('heading')} font-bold text-gray-800`}>
                                Add Existing Players
                              </h3>
                              <button
                                onClick={() => setShowAddPlayersModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                              >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>

                            <div className="space-y-3 max-h-64 overflow-y-auto">
                              {players
                                .filter(p => p.isActive && !currentChampionship.players.includes(p.id))
                                .map((player) => (
                                  <div key={player.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                                    <div>
                                      <p className={`${getClasses('small')} font-bold text-gray-800`}>
                                        {player.firstName} {player.surname}
                                      </p>
                                      <p className={`${getClasses('small')} text-gray-600`}>
                                        {player.userId}
                                      </p>
                                    </div>
                                    <button
                                      onClick={() => {
                                        addPlayerToChampionship(player.id);
                                      }}
                                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded"
                                    >
                                      Add
                                    </button>
                                  </div>
                                ))}
                            </div>

                            {players.filter(p => p.isActive && !currentChampionship.players.includes(p.id)).length === 0 && (
                              <p className={`${getClasses('small')} text-gray-500 text-center py-4`}>
                                All available players are already in this championship
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Add New Player Modal */}
                    <PlayerManagementModal
                      isOpen={showAddNewPlayerModal}
                      onClose={() => setShowAddNewPlayerModal(false)}
                      players={players}
                      onAddPlayer={handleAddNewPlayer}
                      onUpdatePlayer={handleUpdatePlayer}
                      onDeletePlayer={handleDeletePlayer}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // SESSION/MATCH RECORDING VIEW
  if (view === 'session') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100">
        <FontToggle />
        <DebugInfo />
        <ScoringSystemModal />

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
              <div className="flex-1">
                <h1 className={`${getClasses('heading')} font-bold text-gray-800`}>
                  Record Session - {currentChampionship.name}
                </h1>
                <p className={`${getClasses('body')} text-gray-600 font-medium`}>
                  {sessionStep === 'setup' && 'Set up your session'}
                  {sessionStep === 'recording' && `Recording matches for ${sessionDate}`}
                  {sessionStep === 'complete' && 'Session complete'}
                </p>
              </div>
              {sessionStep === 'recording' && (
                <button
                  onClick={() => setShowScoringModal(true)}
                  className={`${getClasses('button')} bg-purple-100 hover:bg-purple-200 text-purple-700 font-bold rounded-2xl flex items-center space-x-3 shadow-lg`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Scoring Help</span>
                </button>
              )}
            </div>

            {/* Session Setup */}
            {sessionStep === 'setup' && (
              <div className="space-y-8">
                <div className="bg-white/90 backdrop-blur rounded-3xl shadow-2xl p-8 border border-gray-200">
                  <h3 className={`${getClasses('heading')} font-bold text-gray-800 mb-6`}>Session Date</h3>
                  <input
                    type="date"
                    value={sessionDate}
                    onChange={(e) => setSessionDate(e.target.value)}
                    className={`${getClasses('input')} border-2 border-gray-300 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-200 transition-all font-medium bg-white/80 w-full max-w-md`}
                  />
                </div>

                <div className="bg-white/90 backdrop-blur rounded-3xl shadow-2xl p-8 border border-gray-200">
                  <h3 className={`${getClasses('heading')} font-bold text-gray-800 mb-6`}>
                    Select Attending Players (minimum 4)
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                    {currentChampionship.players?.map((playerId) => {
                      const player = players.find(p => p.id === playerId);
                      if (!player) return null;

                      return (
                        <label
                          key={playerId}
                          className={`flex items-center space-x-4 p-4 rounded-2xl cursor-pointer transition-all border-2 ${attendingPlayers.includes(playerId)
                            ? 'bg-blue-50 border-blue-300'
                            : 'bg-gray-50 border-gray-200 hover:border-blue-200'
                            }`}
                        >
                          <input
                            type="checkbox"
                            checked={attendingPlayers.includes(playerId)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setAttendingPlayers([...attendingPlayers, playerId]);
                              } else {
                                setAttendingPlayers(attendingPlayers.filter(id => id !== playerId));
                              }
                            }}
                            className="w-5 h-5 text-blue-600 rounded"
                          />
                          <div>
                            <span className={`${getClasses('body')} font-bold text-gray-800`}>
                              {player.firstName} {player.surname}
                            </span>
                            <p className={`${getClasses('small')} text-gray-500`}>
                              {player.userId}
                            </p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                  <div className="mt-6 text-center">
                    <p className={`${getClasses('body')} text-gray-600`}>
                      Selected: <span className="font-bold text-blue-600">{attendingPlayers.length}</span> players
                    </p>
                  </div>
                </div>

                <div className="text-center">
                  <button
                    onClick={() => attendingPlayers.length >= 4 ? setSessionStep('recording') : alert('Please select at least 4 players')}
                    disabled={attendingPlayers.length < 4}
                    className={`${getClasses('button')} bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold rounded-2xl shadow-xl transform hover:scale-105 transition-all`}
                  >
                    Start Session
                  </button>
                </div>
              </div>
            )}

            {/* Match Recording */}
            {sessionStep === 'recording' && (
              <div className="space-y-8">
                <div className="bg-white/90 backdrop-blur rounded-2xl shadow-lg p-6 border border-gray-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className={`${getClasses('body')} font-bold text-gray-800`}>
                        Session: {new Date(sessionDate).toLocaleDateString()}
                      </h3>
                      <p className={`${getClasses('small')} text-gray-600`}>
                        {attendingPlayers.length} players • {sessionMatches.length} matches recorded
                      </p>
                    </div>
                    <button
                      onClick={() => setSessionStep('complete')}
                      className={`${getClasses('button')} bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg`}
                    >
                      Finish Session
                    </button>
                  </div>
                </div>

                <div className="bg-white/90 backdrop-blur rounded-3xl shadow-2xl p-8 border border-gray-200">
                  <h3 className={`${getClasses('heading')} font-bold text-gray-800 mb-6`}>Select Teams for Match</h3>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <h4 className={`${getClasses('body')} font-bold text-blue-600 text-center`}>Team A</h4>
                      <div className="min-h-24 p-4 border-2 border-blue-200 rounded-2xl bg-blue-50">
                        {teamA.length === 0 ? (
                          <p className={`${getClasses('small')} text-gray-500 text-center`}>Select 2 players</p>
                        ) : (
                          <div className="space-y-2">
                            {teamA.map(playerId => (
                              <div key={playerId} className="flex justify-between items-center">
                                <span className={`${getClasses('small')} font-medium`}>
                                  {getPlayerName(playerId)}
                                </span>
                                <button
                                  onClick={() => setTeamA(teamA.filter(id => id !== playerId))}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  ✕
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className={`${getClasses('body')} font-bold text-green-600 text-center`}>Team B</h4>
                      <div className="min-h-24 p-4 border-2 border-green-200 rounded-2xl bg-green-50">
                        {teamB.length === 0 ? (
                          <p className={`${getClasses('small')} text-gray-500 text-center`}>Select 2 players</p>
                        ) : (
                          <div className="space-y-2">
                            {teamB.map(playerId => (
                              <div key={playerId} className="flex justify-between items-center">
                                <span className={`${getClasses('small')} font-medium`}>
                                  {getPlayerName(playerId)}
                                </span>
                                <button
                                  onClick={() => setTeamB(teamB.filter(id => id !== playerId))}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  ✕
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-8">
                    <h4 className={`${getClasses('body')} font-bold text-gray-800 mb-4`}>Available Players</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {attendingPlayers
                        .filter(id => !teamA.includes(id) && !teamB.includes(id))
                        .map(playerId => {
                          return (
                            <div key={playerId} className="space-y-2">
                              <p className={`${getClasses('small')} font-medium text-center`}>
                                {getPlayerName(playerId)}
                              </p>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => teamA.length < 2 && setTeamA([...teamA, playerId])}
                                  disabled={teamA.length >= 2}
                                  className={`flex-1 py-2 px-3 text-sm font-bold rounded-lg ${teamA.length >= 2
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                    }`}
                                >
                                  Team A
                                </button>
                                <button
                                  onClick={() => teamB.length < 2 && setTeamB([...teamB, playerId])}
                                  disabled={teamB.length >= 2}
                                  className={`flex-1 py-2 px-3 text-sm font-bold rounded-lg ${teamB.length >= 2
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                                    }`}
                                >
                                  Team B
                                </button>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>

                  {teamA.length === 2 && teamB.length === 2 && (
                    <div className="mt-8 p-6 bg-gray-50 rounded-2xl border border-gray-200">
                      <h4 className={`${getClasses('body')} font-bold text-gray-800 mb-4 text-center`}>
                        Enter Match Score
                      </h4>
                      <div className="grid grid-cols-3 gap-4 items-center max-w-md mx-auto">
                        <div className="text-center">
                          <p className={`${getClasses('small')} font-bold text-blue-600 mb-2`}>Team A</p>
                          <input
                            type="number"
                            min="0"
                            max="20"
                            value={setScores.teamA}
                            onChange={(e) => setSetScores(prev => ({ ...prev, teamA: e.target.value }))}
                            className="w-full text-center text-2xl font-bold p-3 border-2 border-blue-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                            placeholder="0"
                          />
                        </div>
                        <div className="text-center">
                          <p className={`${getClasses('body')} font-bold text-gray-500`}>vs</p>
                        </div>
                        <div className="text-center">
                          <p className={`${getClasses('small')} font-bold text-green-600 mb-2`}>Team B</p>
                          <input
                            type="number"
                            min="0"
                            max="20"
                            value={setScores.teamB}
                            onChange={(e) => setSetScores(prev => ({ ...prev, teamB: e.target.value }))}
                            className="w-full text-center text-2xl font-bold p-3 border-2 border-green-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200"
                            placeholder="0"
                          />
                        </div>
                      </div>

                      {setScores.teamA && setScores.teamB && (
                        <div className="mt-4 p-4 bg-white rounded-xl border border-gray-200">
                          <p className={`${getClasses('small')} text-center text-gray-600 mb-2`}>Points Preview (CJ System):</p>
                          <div className="flex justify-center space-x-8">
                            <span className="text-blue-600 font-bold">
                              Team A: {calculateCJPoints(setScores.teamA, setScores.teamB)[0]} pts
                            </span>
                            <span className="text-green-600 font-bold">
                              Team B: {calculateCJPoints(setScores.teamA, setScores.teamB)[1]} pts
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="text-center mt-6">
                        <button
                          onClick={handleScoreSubmit}
                          disabled={!setScores.teamA || !setScores.teamB}
                          className={`${getClasses('button')} bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold rounded-2xl shadow-xl transform hover:scale-105 transition-all`}
                        >
                          Record Match
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {sessionMatches.length > 0 && (
                  <div className="bg-white/90 backdrop-blur rounded-3xl shadow-2xl p-8 border border-gray-200">
                    <h3 className={`${getClasses('heading')} font-bold text-gray-800 mb-6`}>
                      Session Matches ({sessionMatches.length})
                    </h3>
                    <div className="space-y-4">
                      {sessionMatches.map((match, index) => (
                        <div key={match.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-200">
                          <div className="grid grid-cols-3 gap-4 items-center">
                            <div className="text-center">
                              <p className={`${getClasses('small')} font-bold text-blue-600`}>Team A</p>
                              <p className={`${getClasses('small')} text-gray-700`}>
                                {match.teamA.map(id => getPlayerName(id)).join(' & ')}
                              </p>
                            </div>
                            <div className="text-center">
                              <p className={`${getClasses('body')} font-bold`}>
                                {match.gamesA} - {match.gamesB}
                              </p>
                              <p className={`${getClasses('small')} text-gray-500`}>
                                {match.points.teamA} - {match.points.teamB} pts
                              </p>
                            </div>
                            <div className="text-center">
                              <p className={`${getClasses('small')} font-bold text-green-600`}>Team B</p>
                              <p className={`${getClasses('small')} text-gray-700`}>
                                {match.teamB.map(id => getPlayerName(id)).join(' & ')}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Session Complete */}
            {sessionStep === 'complete' && (
              <div className="bg-white/90 backdrop-blur rounded-3xl shadow-2xl p-10 border border-gray-200 text-center">
                <div className="text-8xl mb-6">🎾</div>
                <h3 className={`${getClasses('heading')} font-bold text-gray-800 mb-4`}>
                  Session Complete!
                </h3>
                <p className={`${getClasses('body')} text-gray-600 mb-8`}>
                  Recorded {sessionMatches.length} matches for {attendingPlayers.length} players
                </p>
                <div className="space-y-4">
                  <button
                    onClick={() => {
                      setSessionStep('setup');
                      setAttendingPlayers([]);
                      setSessionMatches([]);
                      setTeamA([]);
                      setTeamB([]);
                      setSetScores({ teamA: '', teamB: '' });
                    }}
                    className={`${getClasses('button')} bg-green-600 hover:bg-green-700 text-white font-bold rounded-2xl shadow-lg mr-4`}
                  >
                    Record Another Session
                  </button>
                  <button
                    onClick={() => setView('detail')}
                    className={`${getClasses('button')} bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg`}
                  >
                    View Championship
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Default view
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100">
      <FontToggle />
      <DebugInfo />
      <div className="pt-20 pb-32 px-6">
        <div className="max-w-4xl mx-auto">
          <p className={`${getClasses('body')} text-gray-600`}>Loading...</p>
        </div>
      </div>
    </div>
  );
};

export default ChampionshipManagement;