import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { RoleProvider } from './components/RoleBasedWrapper';
import PadelTournamentApp from './components/PadelTournamentApp';
import ChampionshipManagement from './components/ChampionshipManagement';
import './index.css';

// CRITICAL FIX: Always-visible navigation header
const GlobalHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const isHomePage = location.pathname === '/';
  const isTournamentPage = location.pathname === '/tournaments';
  const isChampionshipPage = location.pathname === '/championships';

  return (
    <header className="bg-gradient-to-r from-blue-800 to-blue-900 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo/Home Button - ALWAYS clickable */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-3 hover:bg-blue-700/50 px-3 py-2 rounded-xl transition-all duration-200"
          >
            <div className="bg-white/20 p-2 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold">Padel Manager</h1>
          </button>

          {/* Navigation Pills - Show when not on home */}
          {!isHomePage && (
            <div className="flex items-center space-x-2 bg-blue-700/30 p-1 rounded-xl">
              <button
                onClick={() => navigate('/championships')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isChampionshipPage
                    ? 'bg-white text-blue-800 shadow-lg'
                    : 'text-blue-100 hover:bg-blue-600/50 hover:text-white'
                }`}
              >
                Championships
              </button>
              <button
                onClick={() => navigate('/tournaments')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isTournamentPage
                    ? 'bg-white text-blue-800 shadow-lg'
                    : 'text-blue-100 hover:bg-blue-600/50 hover:text-white'
                }`}
              >
                Tournaments
              </button>
            </div>
          )}

          {/* Home Button - Always visible */}
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-blue-700/50 rounded-lg transition-colors"
            title="Go to Home"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

// Enhanced HomePage
const HomePage = ({ activeSection, setActiveSection }) => {
  const [lastUsed, setLastUsed] = useState(null);
  const navigate = useNavigate();

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
    <div className="max-w-4xl mx-auto mt-8 px-4">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-800 mb-4">Welcome to Padel Manager</h2>
        <p className="text-xl text-gray-600">Choose your module to get started</p>
      </div>
      
      {/* Hero Card - Continue with last used */}
      {lastUsed && (
        <div className="mb-12">
          <button 
            onClick={() => navigate(`/${lastUsed.type}s`)} 
            className="w-full p-6 bg-gradient-to-r from-blue-600 to-purple-700 text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] group"
          >
            <div className="flex items-center justify-between">
              <div className="text-left">
                <div className="text-sm uppercase tracking-wider opacity-90 mb-2">Continue with</div>
                <h3 className="text-2xl font-bold mb-2">{lastUsed.name}</h3>
                <div className="text-blue-100 text-sm">
                  {lastUsed.type === 'championship' ? 'Championship' : 'Tournament'}
                  {' • '}
                  Last accessed {new Date(lastUsed.timestamp).toLocaleDateString()}
                </div>
              </div>
              <div className="flex items-center text-lg group-hover:transform group-hover:translate-x-2 transition-transform">
                Continue
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
            </div>
          </button>
        </div>
      )}
      
      {/* Main Options */}
      <div className="grid md:grid-cols-2 gap-8">
        <button 
          onClick={() => {
            setActiveSection('championships');
            navigate('/championships');
          }}
          className="group relative overflow-hidden p-8 rounded-2xl shadow-lg bg-white hover:bg-gradient-to-br hover:from-blue-50 hover:to-blue-100 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
        >
          <div className="relative">
            <div className="mb-6">
              <div className="inline-flex p-4 rounded-2xl bg-blue-100 group-hover:bg-blue-200 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-4 text-gray-800">Championships</h3>
            <p className="text-lg leading-relaxed text-gray-600">
              Manage ongoing championships with flexible scoring
            </p>
          </div>
        </button>
        
        <button 
          onClick={() => {
            setActiveSection('tournaments');
            navigate('/tournaments');
          }}
          className="group relative overflow-hidden p-8 rounded-2xl shadow-lg bg-white hover:bg-gradient-to-br hover:from-green-50 hover:to-green-100 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
        >
          <div className="relative">
            <div className="mb-6">
              <div className="inline-flex p-4 rounded-2xl bg-green-100 group-hover:bg-green-200 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-4 text-gray-800">Tournaments</h3>
            <p className="text-lg leading-relaxed text-gray-600">
              Create one-off tournaments with automatic scheduling
            </p>
          </div>
        </button>
      </div>
    </div>
  );
};

// Main App Component
function App() {
  const [activeSection, setActiveSection] = useState('championships');

  return (
    <RoleProvider>
      <div className="App min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* ALWAYS VISIBLE HEADER - This fixes the navigation problem */}
        <GlobalHeader />
        
        <div className="pb-12">
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

// Function to save the last used item
export const saveLastUsedItem = (itemId, itemName, itemType) => {
  const lastUsed = {
    id: itemId,
    name: itemName,
    type: itemType,
    timestamp: Date.now()
  };
  localStorage.setItem('padelManagerLastUsed', JSON.stringify(lastUsed));
};

export default App;