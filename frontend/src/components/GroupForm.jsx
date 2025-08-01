// src/components/GroupForm.jsx
import { useState } from 'react';
import api from '../api';
import './GroupForm.css';

function GroupForm() {
  const [form, setForm] = useState({
    chamber_association: true,
    company_name: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    external_id: '',
    sic_code: ''
  });

  const [locations, setLocations] = useState([
    {
      name: '',
      zip_code: '',
      fips_code: '',
      number_of_employees: '',
      primary: true,
      external_id: ''
    }
  ]);

  const [message, setMessage] = useState('');

  const handleGroupChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLocationChange = (index, e) => {
    const { name, value } = e.target;
    setLocations((prev) => {
      const updated = [...prev];
      updated[index][name] = value;
      return updated;
    });
  };

  const addLocation = () => {
    setLocations((prev) => [
      ...prev,
      {
        name: '',
        zip_code: '',
        fips_code: '',
        number_of_employees: '',
        primary: false,
        external_id: ''
      }
    ]);
  };

  const removeLocation = (index) => {
    setLocations((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const locationPayload = locations.map((loc, i) => ({
      ...loc,
      number_of_employees: parseInt(loc.number_of_employees),
      primary: i === 0,
      external_id: `${form.external_id}-loc-${i + 1}`
    }));

    const payload = {
      group: {
        ...form
      },
      locations: locationPayload
    };

    try {
      const res = await api.post('/groups', payload);
      setMessage(' Group with locations created successfully!');
      console.log('Created group:', res.data);
    } catch (err) {
      console.error(err);
      setMessage(' Failed to create group.');
    }
  };

  return (
    <div className="group-form-container">
      <h2>Create Group</h2>
      <form className="group-form" onSubmit={handleSubmit}>
        <input name="company_name" placeholder="Company Name" onChange={handleGroupChange} required />
        <input name="contact_name" placeholder="Contact Name" onChange={handleGroupChange} required />
        <input name="contact_email" placeholder="Contact Email" type="email" onChange={handleGroupChange} required />
        <input name="contact_phone" placeholder="Contact Phone" onChange={handleGroupChange} required />
        <input name="external_id" placeholder="Unique Group ID" onChange={handleGroupChange} required />
        <input name="sic_code" placeholder="SIC Code (e.g., 0700)" onChange={handleGroupChange} required />

        <div className="location-section">
          <h3>Locations</h3>
          {locations.map((location, index) => (
            <div className="location-box" key={index}>
              <input
                name="name"
                placeholder="Location Name"
                value={location.name}
                onChange={(e) => handleLocationChange(index, e)}
                required
              />
              <input
                name="zip_code"
                placeholder="Zip Code"
                value={location.zip_code}
                onChange={(e) => handleLocationChange(index, e)}
                required
              />
              <input
                name="fips_code"
                placeholder="FIPS Code"
                value={location.fips_code}
                onChange={(e) => handleLocationChange(index, e)}
                required
              />
              <input
                name="number_of_employees"
                placeholder="Number of Employees"
                type="number"
                value={location.number_of_employees}
                onChange={(e) => handleLocationChange(index, e)}
                required
              />
              {index > 0 && (
                <button type="button" onClick={() => removeLocation(index)} className="remove-btn">
                   Remove Location
                </button>
              )}
            </div>
          ))}
        </div>

        <button type="button" className="add-location-btn" onClick={addLocation}>
          ➕ Add Another Location
        </button>

        <button type="submit" className="submit-btn">
           Create Group
        </button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default GroupForm;