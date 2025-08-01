// src/App.jsx
import { useState } from 'react';
import Navbar from './components/Navbar';
import GroupForm from './components/GroupForm';
import GroupList from './components/GroupList';
import GroupDetailView from './components/GroupDetailView';
import './App.css';

function App() {
  const [page, setPage] = useState('list');
  const [selectedGroup, setSelectedGroup] = useState(null);

  const handleGroupSelect = (group) => {
    setSelectedGroup(group);
    setPage('groupDetail');
  };

  const handleBack = () => {
    setSelectedGroup(null);
    setPage('list');
  };

  return (
    <div className="app">
      <Navbar currentPage={page} onNavClick={setPage} />

      <main className="main-content">
        {page === 'form' && (
          <GroupForm
            onClose={() => setPage('list')}
            onCreated={() => setPage('list')}
          />
        )}

        {page === 'list' && (
          <GroupList onGroupSelect={handleGroupSelect} />
        )}

        {page === 'groupDetail' && selectedGroup && (
          <GroupDetailView
            group={selectedGroup}
            onBack={handleBack}
            onDelete={handleBack}
            onRefresh={() => setPage('groupDetail')} // re-fetch if needed
          />
        )}
      </main>
    </div>
  );
}

export default App;