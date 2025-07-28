import React from 'react';
import './Navbar.css';

function Navbar({ onNavClick, currentPage }) {
  return (
    <nav className="navbar">
      <h2 className="navbar-title">Group Insurance Quoting Tool</h2>
      <div className="navbar-buttons">
        <button
          className={currentPage === 'form' ? 'active' : ''}
          onClick={() => onNavClick('form')}
        >
          ➕ Create Group
        </button>
        <button
          className={currentPage === 'list' ? 'active' : ''}
          onClick={() => onNavClick('list')}
        >
          📋 All Groups
        </button>
      </div>
    </nav>
  );
}

export default Navbar;