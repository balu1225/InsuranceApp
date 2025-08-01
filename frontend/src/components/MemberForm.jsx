import { useState, useEffect } from 'react';
import api from '../api';
import './MemberForm.css';

function MemberForm({ groupId, ichraClassId, onMemberAdded, onCancel }) {
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: '',
    zip_code: '',
    fips_code: '',
    retiree: false,
    cobra: false,
    last_used_tobacco: false,
    annual_salary: '',
    hours_per_week: '',
    household_income: '',
    household_size: 1,
    dependents: []
  });

  const [classOptions, setClassOptions] = useState([]);
  const [selectedClass, setSelectedClass] = useState(ichraClassId || '');
  const [message, setMessage] = useState('');


  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await api.get(`/ichra-classes/${groupId}`);
        setClassOptions(res.data);
      } catch (err) {
        console.error('Error loading classes', err);
      }
    };
    fetchClasses();
  }, [groupId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddDependent = () => {
    setForm(prev => ({
      ...prev,
      dependents: [...prev.dependents, {
        first_name: '',
        last_name: '',
        date_of_birth: '',
        gender: '',
        relationship: '',
        same_household: true
      }]
    }));
  };

  const handleDependentChange = (index, e) => {
    const { name, value, type, checked } = e.target;
    const updated = [...form.dependents];
    updated[index][name] = type === 'checkbox' ? checked : value;
    setForm(prev => ({
      ...prev,
      dependents: updated
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        group_id: groupId,
        ichra_class_id: selectedClass,
        household_size: form.dependents.length + 1
      };
      await api.post('/members', payload);
      setMessage(' Member added successfully!');
      onMemberAdded(); 
    } catch (err) {
      console.error('Error creating member:', err);
      setMessage(' Failed to add member');
    }
  };

  return (
    <div className="member-form-container">
      <h2>Add Member</h2>
      <form className="member-form" onSubmit={handleSubmit}>
        <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} required>
          <option value="">-- Select ICHRA Class --</option>
          {classOptions.map(cls => (
            <option key={cls._id} value={cls._id}>{cls.class_name}</option>
          ))}
        </select>

        <input name="first_name" placeholder="First Name" value={form.first_name} onChange={handleChange} required />
        <input name="last_name" placeholder="Last Name" value={form.last_name} onChange={handleChange} required />
        <input name="date_of_birth" type="date" value={form.date_of_birth} onChange={handleChange} required />
        <input name="zip_code" placeholder="ZIP Code" value={form.zip_code} onChange={handleChange} required />
        <input name="fips_code" placeholder="FIPS Code" value={form.fips_code} onChange={handleChange} />
        <input name="gender" placeholder="Gender" value={form.gender} onChange={handleChange} />

        <label>
          <input type="checkbox" name="retiree" checked={form.retiree} onChange={handleChange} />
          Retiree
        </label>
        <label>
          <input type="checkbox" name="cobra" checked={form.cobra} onChange={handleChange} />
          COBRA
        </label>
        <label>
          <input type="checkbox" name="last_used_tobacco" checked={form.last_used_tobacco} onChange={handleChange} />
          Used Tobacco
        </label>

        <input name="annual_salary" type="number" placeholder="Annual Salary" value={form.annual_salary} onChange={handleChange} />
        <input name="hours_per_week" type="number" placeholder="Hours per Week" value={form.hours_per_week} onChange={handleChange} />
        <input name="household_income" type="number" placeholder="Household Income" value={form.household_income} onChange={handleChange} />

        {/* Dependents */}
        <div className="dependent-section">
          <h3>Dependents</h3>
          {form.dependents.map((dep, idx) => (
            <div key={idx} className="dependent-entry">
              <input name="first_name" placeholder="First Name" value={dep.first_name} onChange={(e) => handleDependentChange(idx, e)} />
              <input name="last_name" placeholder="Last Name" value={dep.last_name} onChange={(e) => handleDependentChange(idx, e)} />
              <input name="date_of_birth" type="date" value={dep.date_of_birth} onChange={(e) => handleDependentChange(idx, e)} />
              <input name="gender" placeholder="Gender" value={dep.gender} onChange={(e) => handleDependentChange(idx, e)} />
              <input name="relationship" placeholder="Relationship" value={dep.relationship} onChange={(e) => handleDependentChange(idx, e)} />
              <label>
                <input type="checkbox" name="same_household" checked={dep.same_household} onChange={(e) => handleDependentChange(idx, e)} />
                Same Household
              </label>
            </div>
          ))}
          <button type="button" onClick={handleAddDependent}>➕ Add Dependent</button>
        </div>

        <button type="submit">Submit</button>
        <button type="button" onClick={onCancel}>Cancel</button>
        {message && <p>{message}</p>}
      </form>
    </div>
  );
}

export default MemberForm;