import React, { useState } from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { RoleProvider } from './components/RoleBasedWrapper';
import PadelTournamentApp from './components/PadelTournamentApp';
import ChampionshipManagement from './components/ChampionshipManagement';
import './index.css';

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
            <Route path="/tournaments" element={<PadelTournamentApp />} />
            <Route path="/championships" element={<ChampionshipManagement />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </RoleProvider>
  );
}

// New HomePage component
const HomePage = ({ activeSection, setActiveSection }) => {
  return (
    <div className="max-w-4xl mx-auto mt-12">
      <h2 className="text-4xl font-bold text-center text-blue-800 mb-12">Choose a Module</h2>
      
      <div className="grid md:grid-cols-2 gap-8">
        {/* Championships Card */}
        <Link 
          to="/championships"
          className={`block p-6 rounded-xl shadow-lg transform transition-all duration-200 ${
            activeSection === 'championships' 
              ? 'bg-blue-700 text-white scale-105 shadow-xl' 
              : 'bg-white text-blue-800 hover:scale-105 hover:shadow-xl'
          }`}
          onClick={() => setActiveSection('championships')}
        >
          <div className="text-center">
            <div className="mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>
            <h3 className="text-3xl font-bold mb-2">Championships</h3>
            <p className={`text-lg ${activeSection === 'championships' ? 'text-blue-100' : 'text-gray-600'}`}>
              Manage ongoing championships with flexible scoring and player management
            </p>
          </div>
        </Link>
        
        {/* Tournaments Card */}
        <Link 
          to="/tournaments"
          className={`block p-6 rounded-xl shadow-lg transform transition-all duration-200 ${
            activeSection === 'tournaments' 
              ? 'bg-blue-700 text-white scale-105 shadow-xl' 
              : 'bg-white text-blue-800 hover:scale-105 hover:shadow-xl'
          }`}
          onClick={() => setActiveSection('tournaments')}
        >
          <div className="text-center">
            <div className="mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-3xl font-bold mb-2">Tournaments</h3>
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