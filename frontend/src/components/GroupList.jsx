import { useEffect, useState } from 'react';
import api from '../api';
import './GroupList.css';
import './IchraClassForm.css';
import './IchraClassList.css';

import IchraClassForm from './IchraClassForm';
import IchraClassList from './IchraClassList';

function GroupList() {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [message, setMessage] = useState('');

  const fetchGroups = async () => {
    try {
      const res = await api.get('/groups');
      setGroups(res.data);
    } catch (err) {
      console.error('Error fetching groups:', err);
      setMessage('❌ Failed to load groups.');
    }
  };

  const handleDeleteGroup = async () => {
    if (!selectedGroup) return;
    if (confirm(`Are you sure you want to delete group "${selectedGroup.company_name}"?`)) {
      try {
        await api.delete(`/groups/${selectedGroup._id}`);
        setSelectedGroup(null);
        fetchGroups();
      } catch (err) {
        console.error('Delete failed:', err);
        alert('❌ Failed to delete group');
      }
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  if (selectedGroup) {
    return (
      <div className="group-detail-wrapper">

        {/* ✅ NAVBAR-LIKE ACTIONS */}
        <div className="group-navbar">
          <button className="go-home-btn" onClick={() => window.location.href = '/'}>🏠 Home</button>
          <button onClick={fetchGroups}>🔄 Refresh</button>
          <button onClick={() => setSelectedGroup(null)}>🔙 Back</button>
          <button className="delete-btn" onClick={handleDeleteGroup}>🗑️ Delete Group</button>
        </div>

        {/* ✅ GROUP DETAILS */}
        <div className="group-info">
          <h2>{selectedGroup.company_name}</h2>
          <p><strong>Contact:</strong> {selectedGroup.contact_name} ({selectedGroup.contact_email})</p>
          <p><strong>Phone:</strong> {selectedGroup.contact_phone}</p>
          <p><strong>External ID:</strong> {selectedGroup.external_id}</p>
          <p><strong>SIC Code:</strong> {selectedGroup.sic_code}</p>
          <strong>Locations:</strong>
          <ul>
            {selectedGroup.locations.map((loc, idx) => (
              <li key={idx}>
                📍 {loc.name} – {loc.zip_code} – {loc.fips_code} – {loc.number_of_employees} employees
              </li>
            ))}
          </ul>
        </div>

        {/* ✅ CLASS FORM + LIST */}
        <div className="group-actions">
          <h3>➕ Add Class</h3>
          <IchraClassForm groupId={selectedGroup._id} onCreated={() => {}} />

          <h3>📋 Existing Classes</h3>
          <IchraClassList groupId={selectedGroup._id} />
        </div>
      </div>
    );
  }

  return (
    <div className="group-list-wrapper">
      <h2>All Groups</h2>
      {message && <p className="message">{message}</p>}
      <div className="group-grid">
        {groups.map((group) => (
          <div
            key={group._id}
            className="group-card group-clickable"
            onClick={() => setSelectedGroup(group)}
          >
            <h3>{group.company_name}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}

export default GroupList;