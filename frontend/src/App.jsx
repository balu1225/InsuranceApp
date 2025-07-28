// src/App.jsx
import { useState } from 'react';
import GroupForm from './components/GroupForm';
import GroupList from './components/GroupList';
import './App.css';
import './components/GroupForm.css';
import './components/GroupList.css';

function App() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="app">
      <nav className="navbar">
        <h1>Group Insurance Quoting Tool</h1>
        <button className="add-group-btn" onClick={() => setShowForm(true)}>➕ Add Group</button>
      </nav>

      <main className="main-content">
        <GroupList />
      </main>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <button className="close-btn" onClick={() => setShowForm(false)}>✖</button>
            <GroupForm onClose={() => setShowForm(false)} />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;