import { useState } from 'react';
import IchraClassForm from './IchraClassForm';
import IchraClassList from './IchraClassList';
import MemberForm from './MemberForm';
import MemberList from './MemberList';
import './GroupDetailView.css';

function GroupDetailView({ group, onBack, onDelete, onRefresh }) {
  const [showClassForm, setShowClassForm] = useState(false);
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState(null);

  return (
    <div className="group-detail-wrapper">
      {/* 🔷 Navbar */}
      <div className="group-navbar">
        <div className="group-navbar-left">
          <h2>{group.company_name}</h2>
        </div>
        <div className="group-navbar-right">
          <button onClick={onBack}>🏠 Home</button>
          <button onClick={onRefresh}>🔄 Refresh</button>
          <button onClick={onDelete}>🗑️ Delete Group</button>
        </div>
      </div>

      {/* 🔷 Info */}
      <div className="group-info">
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

      {/* 🔷 Actions */}
      <div className="group-actions">
        <button className="open-form-btn" onClick={() => setShowClassForm(true)}>➕ Add ICHRA Class</button>
        <button className="open-form-btn" onClick={() => setShowMemberForm(true)}>➕ Add Member</button>
      </div>

      {/* 🔷 Class List */}
      <div className="class-list-section">
        <h3>📋 Existing Classes</h3>
        <IchraClassList groupId={group._id} onClassSelect={setSelectedClassId} />
      </div>

      {/* 🔷 Members */}
      <div className="member-list-section">
        <h3>👥 Members</h3>
        <MemberList groupId={group._id} />
      </div>

      {/* 🔷 Modal: Class Form */}
      {showClassForm && (
        <div className="modal-overlay">
          <div className="modal">
            <button className="close-btn" onClick={() => setShowClassForm(false)}>✖</button>
            <IchraClassForm
              groupId={group._id}
              onCreated={() => {
                setShowClassForm(false);
                onRefresh();
              }}
            />
          </div>
        </div>
      )}

      {/* 🔷 Modal: Member Form */}
      {showMemberForm && (
        <div className="modal-overlay">
          <div className="modal">
            <button className="close-btn" onClick={() => setShowMemberForm(false)}>✖</button>
            <MemberForm
              groupId={group._id}
              ichraClassId={selectedClassId}
              onMemberAdded={() => {
                setShowMemberForm(false);
                onRefresh();
              }}
              onCancel={() => setShowMemberForm(false)} // ✅ This line ensures close works
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default GroupDetailView;