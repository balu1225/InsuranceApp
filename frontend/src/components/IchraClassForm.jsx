// src/components/IchraClassForm.jsx
import { useState } from 'react';
import api from '../api';
import './IchraClassForm.css';

function IchraClassForm({ groupId, onCreated }) {
  const [form, setForm] = useState({
    class_name: '',
    subclass_name: '',
    contribution: {
      employee: '',
      dependents: ''
    }
  });

  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'employee' || name === 'dependents') {
      setForm(prev => ({
        ...prev,
        contribution: {
          ...prev.contribution,
          [name]: value
        }
      }));
    } else {
      setForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        group_id: groupId,
        class_name: form.class_name,
        subclass_name: form.subclass_name,
        contribution: {
          employee: Number(form.contribution.employee),
          dependents: Number(form.contribution.dependents)
        }
      };

      await api.post('/ichra-classes', payload);
      setMessage(' ICHRA Class created successfully');
      setForm({ class_name: '', subclass_name: '', contribution: { employee: '', dependents: '' }});
      onCreated();
    } catch (err) {
      console.error(err);
      setMessage(' Failed to create ICHRA class');
    }
  };

  return (
    <div className="ichra-form-container">
      <h2>Create ICHRA Class</h2>
      <form className="ichra-form" onSubmit={handleSubmit}>
        <input name="class_name" placeholder="Class Name" value={form.class_name} onChange={handleChange} required />
        <input name="subclass_name" placeholder="Subclass (optional)" value={form.subclass_name} onChange={handleChange} />
        <input name="employee" type="number" placeholder="Employee Contribution" value={form.contribution.employee} onChange={handleChange} required />
        <input name="dependents" type="number" placeholder="Dependent Contribution" value={form.contribution.dependents} onChange={handleChange} required />
        <button type="submit">➕ Add Class</button>
      </form>
      {message && <p className="message">{message}</p>}
    </div>
  );
}

export default IchraClassForm;