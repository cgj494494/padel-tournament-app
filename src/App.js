import React from 'react';
import './override.css'; // Import the override CSS file last
import PadelTournamentApp from './components/PadelTournamentApp';

function App() {
  return (
    <div className="App">
      <PadelTournamentApp />
    </div>
  );
}

export default App;
