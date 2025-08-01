import { useState, useEffect } from 'react';
import IchraClassForm from './IchraClassForm';
import IchraClassList from './IchraClassList';
import MemberForm from './MemberForm';
import MemberList from './MemberList';
import api from '../api';
import './GroupDetailView.css';

function GroupDetailView({ group, onBack, onDelete, onRefresh }) {
  const [showClassForm, setShowClassForm] = useState(false);
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [classes, setClasses] = useState([]);

  const fetchClasses = async () => {
    try {
      const res = await api.get(`/ichra-classes/${group._id}`);
      setClasses(res.data);
    } catch (err) {
      console.error('Failed to fetch classes:', err);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, [group._id]);

  return (
    <div className="group-detail-wrapper">
      {/* 🔷 Header */}
      <div className="group-header">
        <h2>{group.company_name}</h2>
        <div className="group-header-buttons">
          <button onClick={onBack}>🏠 Home</button>
          <button onClick={onRefresh}>🔄 Refresh</button>
          <button onClick={onDelete}>🗑️ Delete Group</button>
        </div>
      </div>

      <div className="group-body">
        {/* 🔹 Left Panel: Group Info */}
        <div className="group-info-panel">
          <p><strong>Contact:</strong> {group.contact_name} ({group.contact_email})</p>
          <p><strong>Phone:</strong> {group.contact_phone}</p>
          <p><strong>External ID:</strong> {group.external_id}</p>
          <p><strong>SIC Code:</strong> {group.sic_code}</p>
          <strong>Locations:</strong>
          <ul>
            {group.locations.map((loc, idx) => (
              <li key={idx}>
                📍 {loc.name} – {loc.zip_code} – {loc.fips_code} – {loc.number_of_employees} employees
              </li>
            ))}
          </ul>
        </div>

        {/* 🔹 Right Panel */}
        <div className="group-main-panel">
          {/* Toggle Add Class */}
          <div className="class-form-toggle">
            <h3 onClick={() => setShowClassForm(!showClassForm)} style={{ cursor: 'pointer' }}>
              {showClassForm ? '➖ Cancel Add Class' : '➕ Add Class'}
            </h3>
            {showClassForm && (
              <div className="class-form-expanded">
                <IchraClassForm
                  groupId={group._id}
                  onCreated={() => {
                    setShowClassForm(false);
                    fetchClasses();
                    onRefresh();
                  }}
                />
              </div>
            )}
          </div>

          {/* Class List */}
          <div className="class-list-section">
            <div className="class-list-header">
              <h3>📋 Existing Classes</h3>
              <button onClick={fetchClasses}>🔄 Refresh Classes</button>
            </div>
            <IchraClassList
              groupId={group._id}
              onClassSelect={setSelectedClassId}
            />
          </div>

          {/* Add Member Button */}
          <div className="member-form-toggle">
            <h3 onClick={() => setShowMemberForm(true)} style={{ cursor: 'pointer' }}>➕ Add Member</h3>
          </div>

          {/* Member List */}
          <div className="member-list-section">
            <h3>👥 Members</h3>
            <MemberList groupId={group._id} />
          </div>
        </div>
      </div>

      {/* Member Form Modal */}
      {showMemberForm && (
        <div className="modal-overlay">
          <div className="modal">
            <button className="close-btn" onClick={() => setShowMemberForm(false)}>✖</button>
            <MemberForm
              groupId={group._id}
              locationId={group.locations[0]?.id}
              ichraClasses={classes}
              onClose={() => setShowMemberForm(false)}
              onSuccess={() => {
                setShowMemberForm(false);
                onRefresh();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default GroupDetailView;