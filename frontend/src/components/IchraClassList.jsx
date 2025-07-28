import { useEffect, useState } from 'react';
import api from '../api';
import './IchraClassList.css';

function IchraClassList({ groupId }) {
  const [classes, setClasses] = useState([]);
  const [message, setMessage] = useState('');

  const fetchClasses = async () => {
    try {
      const res = await api.get(`/ichra-classes/${groupId}`);
      setClasses(res.data);
    } catch (err) {
      console.error('Failed to fetch classes:', err);
      setMessage('❌ Error loading ICHRA classes.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/ichra-classes/${id}`);
      setMessage('🗑️ Class deleted.');
      fetchClasses();
    } catch (err) {
      console.error('Delete failed:', err);
      setMessage('❌ Failed to delete class.');
    }
  };

  useEffect(() => {
    fetchClasses();
  }, [groupId]);

  return (
    <div className="ichra-class-list-container">
      <h3>Defined ICHRA Classes</h3>
      {message && <p className="message">{message}</p>}

      <div className="ichra-grid">
        {classes.map((c) => (
          <div key={c._id} className="ichra-card">
            <h4>{c.class_name}</h4>
            {c.subclass_name && <p><strong>Subclass:</strong> {c.subclass_name}</p>}
            <p><strong>Employee Contribution:</strong> ${c.contribution.employee}</p>
            <p><strong>Dependent Contribution:</strong> ${c.contribution.dependents}</p>
            <button className="delete-btn" onClick={() => handleDelete(c._id)}>❌ Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default IchraClassList;