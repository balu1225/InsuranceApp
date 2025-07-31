import { useEffect, useState } from 'react';
import api from '../api';
import './MemberList.css';

function MemberList({ groupId, ichraClassId }) {
  const [members, setMembers] = useState([]);

  const load = async () => {
    try {
      const res = await api.get(`/groups/${groupId}/members`);
      let data = res.data;
      // if a class filter is set, only show those
      if (ichraClassId) {
        data = data.filter((m) => m.ichra_class_id === ichraClassId);
      }
      setMembers(data);
    } catch (err) {
      console.error('❌ Failed to fetch members', err);
    }
  };

  useEffect(load, [groupId, ichraClassId]);

  const delAll = async () => {
    if (!window.confirm('Delete all members?')) return;
    try {
      await api.delete(`/groups/${groupId}/members`);
      setMembers([]);
    } catch (err) {
      console.error('❌ Delete all failed', err);
    }
  };

  return (
    <div className="member-list-container">
      <div className="member-toolbar">
        <h4>All Members</h4>
        <button onClick={delAll}>🗑️ Delete All</button>
      </div>
      <div className="member-grid">
        {members.map((m) => (
          <div key={m._id} className="member-card">
            <strong>{m.first_name} {m.last_name}</strong>
            <p>Gender: {m.gender}</p>
            <p>DOB: {m.date_of_birth}</p>
            <p>ZIP: {m.zip_code}</p>
            <p>Salary: ${m.annual_salary}</p>
            <button>✏️ Update</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MemberList;