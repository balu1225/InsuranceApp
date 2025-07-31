import { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import api from '../api';
import './MemberForm.css';

function MemberForm({ groupId, ichraClassId, locationId, onMemberAdded, onClose }) {
  const [fd, setFd] = useState({
    cobra: false,
    retiree: false,
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: '',
    zip_code: '',
    fips_code: '',
    location_id: locationId || '',
    external_id: '',
    annual_salary: '',
    hours_per_week: '',
    household_income: '',
    household_size: '',
    safe_harbor_income: '',
    last_used_tobacco: '',
    dependents: [],
  });

  const change = (k, v) => setFd({ ...fd, [k]: v });
  const depChange = (i, k, v) => {
    const up = [...fd.dependents];
    up[i][k] = v;
    setFd({ ...fd, dependents: up });
  };

  const addDep = () => setFd({
    ...fd,
    dependents: [...fd.dependents, {
      first_name: '', last_name: '', date_of_birth: '', gender: '',
      relationship: '', same_household: true, last_used_tobacco: '',
    }],
  });

  const remDep = (i) => {
    const up = [...fd.dependents];
    up.splice(i, 1);
    setFd({ ...fd, dependents: up });
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/groups/${groupId}/members`, {
        ichraClassId,
        members: [{ ...fd, location_id: locationId }],
      });
      onMemberAdded();
    } catch {
      alert('❌ Add member failed');
    }
  };

  return (
    <div className="member-modal-overlay">
      <div className="member-modal">
        <button className="close-btn" onClick={onClose}>✖</button>
        <h3>➕ Add Member</h3>
        <form className="member-form" onSubmit={submit}>
          <label>First Name:<input required value={fd.first_name} onChange={(e) => change('first_name', e.target.value)} /></label>
          <label>Last Name:<input required value={fd.last_name} onChange={(e) => change('last_name', e.target.value)} /></label>
          <label>Gender:
            <select required value={fd.gender} onChange={(e) => change('gender', e.target.value)}>
              <option/><option value="M">Male</option><option value="F">Female</option>
            </select>
          </label>
          <label>DOB:
            <DatePicker
              selected={fd.date_of_birth ? new Date(fd.date_of_birth) : null}
              onChange={(d) => change('date_of_birth', d.toISOString().split('T')[0])}
              dateFormat="yyyy-MM-dd"
              placeholderText="yyyy-MM-dd"
              showYearDropdown scrollableYearDropdown
            />
          </label>
          <label>Last Tobacco:
            <DatePicker
              selected={fd.last_used_tobacco ? new Date(fd.last_used_tobacco) : null}
              onChange={(d) => change('last_used_tobacco', d.toISOString().split('T')[0])}
              dateFormat="yyyy-MM-dd"
              placeholderText="yyyy-MM-dd"
            />
          </label>
          <label>ZIP:<input required value={fd.zip_code} onChange={(e) => change('zip_code', e.target.value)} /></label>
          <label>FIPS:<input required value={fd.fips_code} onChange={(e) => change('fips_code', e.target.value)} /></label>
          <label>External ID:<input required value={fd.external_id} onChange={(e) => change('external_id', e.target.value)} /></label>
          <label>COBRA:<input type="checkbox" checked={fd.cobra} onChange={(e) => change('cobra', e.target.checked)} /></label>
          <label>Retiree:<input type="checkbox" checked={fd.retiree} onChange={(e) => change('retiree', e.target.checked)} /></label>
          <label>Salary:<input type="number" value={fd.annual_salary} onChange={(e) => change('annual_salary', e.target.value)} /></label>
          <label>Hrs/Week:<input type="number" value={fd.hours_per_week} onChange={(e) => change('hours_per_week', e.target.value)} /></label>
          <label>HH Income:<input type="number" value={fd.household_income} onChange={(e) => change('household_income', e.target.value)} /></label>
          <label>HH Size:<input type="number" value={fd.household_size} onChange={(e) => change('household_size', e.target.value)} /></label>
          <label>Safe Harbor:<input type="number" value={fd.safe_harbor_income} onChange={(e) => change('safe_harbor_income', e.target.value)} /></label>

          <h4>👶 Dependents</h4>
          {fd.dependents.map((d, i) => (
            <div key={i} className="dependent-box">
              <label>First:<input value={d.first_name} onChange={(e) => depChange(i,'first_name',e.target.value)} /></label>
              <label>Last:<input value={d.last_name} onChange={(e) => depChange(i,'last_name',e.target.value)} /></label>
              <label>Gender:
                <select value={d.gender} onChange={(e) => depChange(i,'gender',e.target.value)}>
                  <option/><option value="M">M</option><option value="F">F</option>
                </select>
              </label>
              <label>DOB:
                <DatePicker
                  selected={d.date_of_birth ? new Date(d.date_of_birth) : null}
                  onChange={(dt) => depChange(i,'date_of_birth',dt.toISOString().split('T')[0])}
                  dateFormat="yyyy-MM-dd"
                  placeholderText="yyyy-MM-dd"
                />
              </label>
              <label>Tobacco:
                <DatePicker
                  selected={d.last_used_tobacco ? new Date(d.last_used_tobacco) : null}
                  onChange={(dt) => depChange(i,'last_used_tobacco',dt.toISOString().split('T')[0])}
                  dateFormat="yyyy-MM-dd"
                  placeholderText="yyyy-MM-dd"
                />
              </label>
              <label>Rel:<input value={d.relationship} onChange={(e) => depChange(i,'relationship',e.target.value)} /></label>
              <label>Same HH:<input type="checkbox" checked={d.same_household} onChange={(e) => depChange(i,'same_household',e.target.checked)} /></label>
              <button type="button" onClick={() => remDep(i)}>❌ Remove</button>
            </div>
          ))}
          <button type="button" onClick={addDep}>➕ Add Dependent</button>

          <button type="submit" className="submit-btn">Submit Member</button>
        </form>
      </div>
    </div>
  );
}

export default MemberForm;