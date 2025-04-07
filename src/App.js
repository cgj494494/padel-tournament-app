import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { RoleProvider } from './components/RoleBasedWrapper';
import PadelTournamentApp from './components/PadelTournamentApp';
import ChampionshipManagement from './components/ChampionshipManagement';
import './index.css';

function App() {
  return (
    <RoleProvider>
      <Router>
        <div className="App min-h-screen bg-gray-50">
          <nav className="bg-blue-800 text-white p-4 shadow-md">
            <div className="max-w-6xl mx-auto flex justify-between items-center">
              <h1 className="text-xl font-bold">Padel Management System</h1>
              <div className="flex space-x-4">
                <Link to="/" className="px-3 py-2 rounded hover:bg-blue-700 transition-colors">
                  Tournaments
                </Link>
                <Link to="/championships" className="px-3 py-2 rounded hover:bg-blue-700 transition-colors">
                  Championships
                </Link>
              </div>
            </div>
          </nav>
          
          <div className="container mx-auto p-4">
            <Routes>
              <Route path="/" element={<PadelTournamentApp />} />
              <Route path="/championships" element={<ChampionshipManagement />} />
            </Routes>
          </div>
        </div>
      </Router>
    </RoleProvider>
  );
}

export default App;
