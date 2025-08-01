// src/components/MemberList.jsx
import { useEffect, useState } from 'react';
import api from '../api';
import './MemberList.css';

function MemberList({ groupId }) {
  const [members, setMembers] = useState([]);
  const [message, setMessage] = useState('');

  const fetchMembers = async () => {
    try {
      const res = await api.get(`/members/${groupId}`);
      setMembers(res.data);
    } catch (err) {
      console.error('Failed to fetch members:', err);
      setMessage(' Error loading members.');
    }
  };

  const handleDelete = async (memberId) => {
    try {
      await api.delete(`/members/${groupId}/${memberId}`);
      setMessage('🗑️ Member deleted.');
      fetchMembers(); // refresh list
    } catch (err) {
      console.error('Failed to delete member:', err);
      setMessage('Could not delete member.');
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [groupId]);

  return (
    <div className="member-list">
      {message && <p className="message">{message}</p>}
      {members.map((m) => (
        <div key={m._id} className="member-card">
          <p><strong>Name:</strong> {m.first_name} {m.last_name}</p>
          <p><strong>DOB:</strong> {m.date_of_birth}</p>
          <p><strong>Zip:</strong> {m.zip_code}</p>
          <p><strong>Class ID:</strong> {m.ichra_class_id}</p>
          <button className="delete-btn" onClick={() => handleDelete(m._id)}> Delete</button>
        </div>
      ))}
    </div>
  );
}

export default MemberList;