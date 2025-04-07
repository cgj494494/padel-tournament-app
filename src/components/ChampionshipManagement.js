import React, { useState, useEffect } from 'react';
import { StorageManager } from './StorageManager';
import { useRole, RoleBasedWrapper, AdminOnly } from './RoleBasedWrapper';
import { v4 as uuidv4 } from 'uuid';

/**
 * ChampionshipManagement Component
 * 
 * Entry point for the Championship System, allowing users to:
 * - View a list of championships
 * - Create new championships
 * - Navigate to championship details
 */
const ChampionshipManagement = () => {
  const [championships, setChampionships] = useState([]);
  const [view, setView] = useState('list'); // 'list', 'create', 'detail'
  const [currentChampionship, setCurrentChampionship] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'admin', 'player'
  const { userId } = useRole();

  // Load championships on component mount
  useEffect(() => {
    loadChampionships();
  }, []);

  /**
   * Load championships from storage
   */
  const loadChampionships = () => {
    const loadedChampionships = StorageManager.loadChampionships();
    setChampionships(loadedChampionships);
  };

  /**
   * Determine user's role for a championship
   */
  const determineUserRole = (championship) => {
    // Check if user is an administrator
    const isAdmin = championship.administrators?.some(admin => admin.userId === userId);
    
    // Check if user is an owner (can't be removed)
    const isOwner = championship.administrators?.some(
      admin => admin.userId === userId && admin.role === 'owner'
    );
    
    // Check if user is a player
    const isPlayer = championship.players?.includes(userId);
    
    if (isOwner) return 'owner';
    if (isAdmin) return 'admin';
    if (isPlayer) return 'player';
    return null;
  };

  /**
   * Filter championships based on user's role
   */
  const getFilteredChampionships = () => {
    if (filter === 'all') return championships;
    
    return championships.filter(championship => {
      const role = determineUserRole(championship);
      
      if (filter === 'admin') {
        return role === 'admin' || role === 'owner';
      }
      
      if (filter === 'player') {
        return role === 'player';
      }
      
      return false;
    });
  };

  /**
   * Handle creating a new championship
   */
  const handleCreateChampionship = (newChampionship) => {
    // Add the new championship to state and storage
    const updatedChampionships = [...championships, newChampionship];
    setChampionships(updatedChampionships);
    StorageManager.saveChampionships(updatedChampionships);
    
    // Reset view to list
    setView('list');
  };

  /**
   * Handle deleting a championship
   */
  const handleDeleteChampionship = (championshipId) => {
    // Remove from state
    const updatedChampionships = championships.filter(c => c.id !== championshipId);
    setChampionships(updatedChampionships);
    
    // Remove from storage (including related data)
    StorageManager.deleteChampionship(championshipId);
  };

  /**
   * Render championship creation form
   */
  const renderCreateForm = () => {
    return <ChampionshipCreationForm onSave={handleCreateChampionship} onCancel={() => setView('list')} />;
  };

  /**
   * Render championship detail view
   */
  const renderDetailView = () => {
    if (!currentChampionship) return <div>No championship selected</div>;
    
    return <ChampionshipDetail 
      championship={currentChampionship} 
      onBack={() => setView('list')} 
      onDelete={handleDeleteChampionship}
    />;
  };

  /**
   * Render championship list
   */
  const renderChampionshipList = () => {
    const filteredChampionships = getFilteredChampionships();
    
    return (
      <div>
        {/* Filter Controls */}
        <div className="mb-4 flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg ${filter === 'all' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('admin')}
            className={`px-4 py-2 rounded-lg ${filter === 'admin' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            Admin
          </button>
          <button
            onClick={() => setFilter('player')}
            className={`px-4 py-2 rounded-lg ${filter === 'player' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            Player
          </button>
        </div>
        
        {/* Create New Button */}
        <div className="mb-6">
          <button
            onClick={() => setView('create')}
            className="px-6 py-3 bg-green-600 text-white rounded-lg font-bold flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Create New Championship
          </button>
        </div>
        
        {/* Championship Cards */}
        <div className="space-y-4">
          {filteredChampionships.length === 0 ? (
            <div className="p-8 bg-gray-50 rounded-lg border border-gray-200 text-center text-gray-500">
              No championships found. Create your first championship to get started.
            </div>
          ) : (
            filteredChampionships.map(championship => (
              <ChampionshipCard
                key={championship.id}
                championship={championship}
                userRole={determineUserRole(championship)}
                onClick={() => {
                  setCurrentChampionship(championship);
                  setView('detail');
                }}
                onDelete={() => handleDeleteChampionship(championship.id)}
              />
            ))
          )}
        </div>
      </div>
    );
  };

  // Main render logic
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-blue-800 mb-6">Padel Championship System</h1>
      
      {view === 'list' && renderChampionshipList()}
      {view === 'create' && renderCreateForm()}
      {view === 'detail' && renderDetailView()}
    </div>
  );
};

/**
 * Championship Card Component
 * Displays a championship in the list
 */
const ChampionshipCard = ({ championship, userRole, onClick, onDelete }) => {
  // Calculate status display
  const getStatusDisplay = () => {
    switch (championship.status) {
      case 'active':
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Active</span>;
      case 'paused':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">Paused</span>;
      case 'completed':
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">Completed</span>;
      default:
        return null;
    }
  };
  
  // Calculate role display
  const getRoleDisplay = () => {
    switch (userRole) {
      case 'owner':
        return <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">Owner</span>;
      case 'admin':
        return <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs">Admin</span>;
      case 'player':
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">Player</span>;
      default:
        return null;
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      <div onClick={onClick} className="cursor-pointer p-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{championship.name}</h3>
            <p className="text-sm text-gray-500">
              Started: {new Date(championship.startDate).toLocaleDateString()}
            </p>
            <p className="text-sm text-gray-500">
              {championship.players?.length || 0} players
            </p>
          </div>
          
          <div className="flex flex-col space-y-2 items-end">
            {getStatusDisplay()}
            {getRoleDisplay()}
          </div>
        </div>
      </div>
      
      {/* Admin-only actions */}
      {(userRole === 'admin' || userRole === 'owner') && (
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex justify-end">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="text-red-600 hover:text-red-800 text-sm font-medium"
          >
            Delete Championship
          </button>
        </div>
      )}
    </div>
  );
};

/**
 * Championship Creation Form
 * Form for creating a new championship
 */
const ChampionshipCreationForm = ({ onSave, onCancel }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState('weekly');
  const { userId } = useRole();
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Create new championship object
    const newChampionship = {
      id: uuidv4(),
      name,
      description,
      startDate: new Date().toISOString(),
      frequency,
      status: 'active',
      administrators: [
        {
          userId,
          role: 'owner',
          addedAt: new Date().toISOString(),
          addedBy: userId
        }
      ],
      players: [userId], // Creator is automatically a player
      configuration: {
        scoringSystem: 'standard',
        baselineSetConsideration: 5,
        maxValidityCalculation: 30,
        allowTieBreaks: true,
        maxRegularGameScore: 9
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    onSave(newChampionship);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6 text-blue-800">Create New Championship</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="name">
            Championship Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            placeholder="Enter championship name"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="description">
            Description (Optional)
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            placeholder="Enter description"
            rows="3"
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 mb-2" htmlFor="frequency">
            Match Frequency
          </label>
          <select
            id="frequency"
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="weekly">Weekly</option>
            <option value="bi-weekly">Bi-Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            disabled={!name.trim()}
          >
            Create Championship
          </button>
        </div>
      </form>
    </div>
  );
};

/**
 * ChampionshipDetail Component
 * 
 * Displays detailed information about a championship
 * This is a simplified version that will be expanded in future development
 */
const ChampionshipDetail = ({ championship, onBack, onDelete }) => {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'sessions', 'standings', 'players'
  const { userId } = useRole();
  
  // Check if user is an administrator
  const isAdmin = championship.administrators?.some(admin => admin.userId === userId);
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="mb-4 flex items-center text-blue-600 hover:text-blue-800"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Championships
        </button>
        
        <div className="flex justify-between items-start">
          <h2 className="text-2xl font-bold text-blue-800">{championship.name}</h2>
          
          {/* Status Badge */}
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            championship.status === 'active' ? 'bg-green-100 text-green-800' :
            championship.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
            'bg-blue-100 text-blue-800'
          }`}>
            {championship.status.charAt(0).toUpperCase() + championship.status.slice(1)}
          </span>
        </div>
        
        {/* Description */}
        {championship.description && (
          <p className="text-gray-600 mt-2">{championship.description}</p>
        )}
      </div>
      
      {/* Tabs */}
      <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-2 rounded-lg font-medium ${
              activeTab === 'overview' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('sessions')}
            className={`px-3 py-2 rounded-lg font-medium ${
              activeTab === 'sessions' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Sessions
          </button>
          <button
            onClick={() => setActiveTab('standings')}
            className={`px-3 py-2 rounded-lg font-medium ${
              activeTab === 'standings' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Standings
          </button>
          <button
            onClick={() => setActiveTab('players')}
            className={`px-3 py-2 rounded-lg font-medium ${
              activeTab === 'players' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Players
          </button>
        </div>
      </div>
      
      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div>
            <h3 className="text-lg font-bold mb-4">Championship Information</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-gray-500 text-sm">Started</p>
                <p className="font-medium">{new Date(championship.startDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Match Frequency</p>
                <p className="font-medium">{championship.frequency.charAt(0).toUpperCase() + championship.frequency.slice(1)}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Status</p>
                <p className="font-medium">{championship.status.charAt(0).toUpperCase() + championship.status.slice(1)}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Player Count</p>
                <p className="font-medium">{championship.players?.length || 0}</p>
              </div>
            </div>
            
            {/* Configuration details */}
            <h3 className="text-lg font-bold mb-4">Configuration</h3>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500 text-sm">Scoring System</p>
                  <p className="font-medium">{championship.configuration?.scoringSystem?.charAt(0).toUpperCase() + championship.configuration?.scoringSystem?.slice(1) || 'Standard'}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Baseline Sets</p>
                  <p className="font-medium">{championship.configuration?.baselineSetConsideration || 5}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Tie Breaks</p>
                  <p className="font-medium">{championship.configuration?.allowTieBreaks ? 'Allowed' : 'Not Allowed'}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Max Game Score</p>
                  <p className="font-medium">{championship.configuration?.maxRegularGameScore || 9}</p>
                </div>
              </div>
            </div>
            
            {/* Admin actions */}
            {isAdmin && (
              <div className="mt-8 border-t border-gray-200 pt-6">
                <div className="flex justify-between">
                  <button
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                  >
                    Edit Championship
                  </button>
                  
                  <button
                    onClick={() => onDelete(championship.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Delete Championship
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'sessions' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold">Sessions</h3>
              
              {isAdmin && (
                <button
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Create Session
                </button>
              )}
            </div>
            
            <div className="text-center p-8 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-gray-500">No sessions yet. Create your first session to get started.</p>
              {isAdmin && (
                <button
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create First Session
                </button>
              )}
            </div>
          </div>
        )}
        
        {activeTab === 'standings' && (
          <div>
            <h3 className="text-lg font-bold mb-6">Championship Standings</h3>
            
            <div className="text-center p-8 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-gray-500">No matches have been played yet. Standings will appear here after matches are recorded.</p>
            </div>
          </div>
        )}
        
        {activeTab === 'players' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold">Players</h3>
              
              {isAdmin && (
                <button
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Add Players
                </button>
              )}
            </div>
            
            {championship.players && championship.players.length > 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Player
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {championship.players.map((playerId) => (
                      <tr key={playerId}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{playerId}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {championship.administrators?.some(admin => admin.userId === playerId && admin.role === 'owner') ? (
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">Owner</span>
                          ) : championship.administrators?.some(admin => admin.userId === playerId) ? (
                            <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs">Admin</span>
                          ) : (
                            <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">Player</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {isAdmin && (
                            <button className="text-indigo-600 hover:text-indigo-900">
                              Manage
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center p-8 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-500">No players have been added yet.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChampionshipManagement;
