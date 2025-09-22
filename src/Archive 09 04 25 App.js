import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { RoleProvider } from './components/RoleBasedWrapper';
import PadelTournamentApp from './components/PadelTournamentApp';
import ChampionshipManagement from './components/ChampionshipManagement';
import './index.css';

// Function to save the last used item
export const saveLastUsedItem = (itemId, itemName, itemType) => {
  const lastUsed = {
    id: itemId,
    name: itemName,
    type: itemType, // 'championship' or 'tournament'
    timestamp: Date.now()
  };
  localStorage.setItem('padelManagerLastUsed', JSON.stringify(lastUsed));
};

function App() {
  const [activeSection, setActiveSection] = useState('championships');

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
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </RoleProvider>
  );
}

// New HomePage component
const HomePage = ({ activeSection, setActiveSection }) => {
  const [lastUsed, setLastUsed] = useState(null);

  // Load last used item on mount
  useEffect(() => {
    const storedLastUsed = localStorage.getItem('padelManagerLastUsed');
    if (storedLastUsed) {
      try {
        setLastUsed(JSON.parse(storedLastUsed));
      } catch (e) {
        console.error('Error parsing last used item', e);
      }
    }
  }, []);

  return (
    <div className="max-w-4xl mx-auto mt-12 home-page">
      <h2 className="text-4xl font-bold text-center text-blue-800 mb-12">Choose a Module</h2>
      
      {/* Hero Card - Only shown if there's a last used item */}
      {lastUsed && (
        <div className="mb-12">
          <Link 
            to={`/${lastUsed.type}s`} 
            className="block p-6 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 press-effect no-select"
            onClick={() => {
              if (navigator.vibrate) navigator.vibrate(20);
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm uppercase tracking-wider opacity-75">Continue with</div>
                <h3 className="text-3xl font-bold mt-1">{lastUsed.name}</h3>
                <div className="mt-2 text-blue-100">
                  {lastUsed.type === 'championship' ? 'Championship' : 'Tournament'}
                  {' • '}
                  Last accessed {new Date(lastUsed.timestamp).toLocaleDateString()}
                </div>
              </div>
              <div className="flex items-center text-xl">
                Continue
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
            </div>
          </Link>
        </div>
      )}
      
      <div className="grid md:grid-cols-2 gap-8 card-grid">
        {/* Championships Card */}
        <Link 
          to="/championships"
          className={`block p-6 rounded-xl shadow-lg transform transition-all duration-200 home-card press-effect no-select ${
            activeSection === 'championships' 
              ? 'bg-blue-700 text-white scale-105 shadow-xl' 
              : 'bg-white text-blue-800 hover:scale-105 hover:shadow-xl'
          }`}
          onClick={() => {
            setActiveSection('championships');
            // Add haptic feedback
            if (navigator.vibrate) {
              navigator.vibrate(20);
            }
          }}
        >
          <div className="text-center">
            <h3 className="text-4xl font-bold mb-4">Championships</h3>
            <div className="mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
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
          className={`block p-6 rounded-xl shadow-lg transform transition-all duration-200 home-card press-effect no-select ${
            activeSection === 'tournaments' 
              ? 'bg-blue-700 text-white scale-105 shadow-xl' 
              : 'bg-white text-blue-800 hover:scale-105 hover:shadow-xl'
          }`}
          onClick={() => {
            setActiveSection('tournaments');
            // Add haptic feedback
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
      </div>
      
      {/* Description Area */}
      <div className="mt-12 p-6 bg-white rounded-xl shadow-md">
        <h3 className="text-2xl font-bold text-blue-800 mb-4">
          {activeSection === 'championships' ? 'About Championships' : 'About Tournaments'}
        </h3>
        
        {activeSection === 'championships' ? (
          <div>
            <p className="text-lg mb-4">
              The <strong>Championship</strong> module allows you to:
            </p>
            <ul className="list-disc pl-6 text-lg space-y-2">
              <li>Create long-running padel championships</li>
              <li>Manage players and teams across multiple sessions</li>
              <li>Track detailed performance metrics</li>
              <li>Calculate pro-rata points and statistics</li>
              <li>View comprehensive standings and player performance</li>
            </ul>
          </div>
        ) : (
          <div>
            <p className="text-lg mb-4">
              The <strong>Tournament</strong> module allows you to:
            </p>
            <ul className="list-disc pl-6 text-lg space-y-2">
              <li>Create one-day or short-term tournaments</li>
              <li>Auto-generate balanced match schedules</li>
              <li>Track scores round by round</li>
              <li>Calculate standings with head-to-head tiebreakers</li>
              <li>Export results to Excel for further analysis</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;