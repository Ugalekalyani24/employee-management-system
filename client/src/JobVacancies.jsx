import React, { useState } from 'react';

const JobVacancies = () => {
  const [vacancies, setVacancies] = useState([
    { id: 'JOB-001', title: 'Senior React Developer', department: 'IT', location: 'Mumbai, MH', salary: '₹8,00,000 - ₹12,00,000 / yr', status: 'Active' },
    { id: 'JOB-002', title: 'HR Generalist', department: 'HR', location: 'Pune, MH', salary: '₹4,50,000 - ₹6,00,000 / yr', status: 'Active' },
    { id: 'JOB-003', title: 'Backend Node.js Engineer', department: 'IT', location: 'Remote', salary: '₹9,00,000 - ₹14,00,000 / yr', status: 'Active' },
    { id: 'JOB-004', title: 'Financial Analyst', department: 'Finance', location: 'Mumbai, MH', salary: '₹6,00,000 - ₹8,50,000 / yr', status: 'Closed' },
    { id: 'JOB-005', title: 'Sales Executive', department: 'Sales', location: 'Thane, MH', salary: '₹3,50,000 - ₹5,00,000 / yr', status: 'Active' },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    department: 'IT',
    location: '',
    salary: '',
    status: 'Active'
  });

  const handlePostJob = (e) => {
    e.preventDefault();
    const newJob = {
      id: `JOB-00${vacancies.length + 1}`,
      ...formData
    };
    setVacancies([newJob, ...vacancies]);
    setShowModal(false);
    setFormData({ title: '', department: 'IT', location: '', salary: '', status: 'Active' });
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <div>
          <h2 style={{ margin: 0 }}>Job Vacancies</h2>
          <p style={{ color: '#64748b', marginTop: 8 }}>Create and manage available job positions.</p>
        </div>
        <button onClick={() => setShowModal(true)} style={addButtonStyle}>
          + Post New Job
        </button>
      </div>

      <div style={tableWrapperStyle}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>Job Title</th>
              <th style={thStyle}>Department</th>
              <th style={thStyle}>Location</th>
              <th style={thStyle}>Salary Range</th>
              <th style={thStyle}>Status</th>
            </tr>
          </thead>
          <tbody>
            {vacancies.map((job) => (
              <tr key={job.id}>
                <td style={tdStyle}>{job.id}</td>
                <td style={tdStyle}><strong>{job.title}</strong></td>
                <td style={tdStyle}>{job.department}</td>
                <td style={tdStyle}>{job.location}</td>
                <td style={tdStyle}>{job.salary}</td>
                <td style={tdStyle}>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    backgroundColor: job.status === 'Active' ? '#dcfce7' : '#fee2e2',
                    color: job.status === 'Active' ? '#15803d' : '#b91c1c'
                  }}>
                    {job.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p style={{ color: '#64748b', marginTop: '16px' }}>Total vacancies: {vacancies.length}</p>

      {showModal && (
        <div style={modalOverlayStyle}>
          <div style={modalStyle}>
            <h2 style={{ marginTop: 0 }}>Post New Job</h2>
            <form onSubmit={handlePostJob}>
              <label style={labelStyle}>Job Title</label>
              <input type="text" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} style={formInputStyle} />
              
              <label style={labelStyle}>Department</label>
              <select value={formData.department} onChange={(e) => setFormData({...formData, department: e.target.value})} style={formInputStyle}>
                <option value="IT">IT</option>
                <option value="HR">HR</option>
                <option value="Sales">Sales</option>
                <option value="Finance">Finance</option>
              </select>

              <label style={labelStyle}>Location</label>
              <input type="text" required value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} style={formInputStyle} />

              <label style={labelStyle}>Salary Range</label>
              <input type="text" required value={formData.salary} onChange={(e) => setFormData({...formData, salary: e.target.value})} style={formInputStyle} />

              <div style={modalButtonsStyle}>
                <button type="button" onClick={() => setShowModal(false)} style={cancelButtonStyle}>Cancel</button>
                <button type="submit" style={addButtonStyle}>Post Job</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Styles
const containerStyle = { padding: '24px', width: '100%', boxSizing: 'border-box', color: '#1e293b' };
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '24px' };
const addButtonStyle = { backgroundColor: '#2563eb', color: '#ffffff', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 };
const tableWrapperStyle = { width: '100%', overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '10px' };
const tableStyle = { width: '100%', minWidth: '760px', borderCollapse: 'collapse', backgroundColor: '#ffffff' };
const thStyle = { textAlign: 'left', padding: '14px 12px', backgroundColor: '#f1f5f9', color: '#334155', borderBottom: '1px solid #e2e8f0' };
const tdStyle = { padding: '13px 12px', borderBottom: '1px solid #e2e8f0', fontSize: '14px' };
const modalOverlayStyle = { position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.55)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '16px', zIndex: 1000 };
const modalStyle = { backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', width: '100%', maxWidth: '480px' };
const labelStyle = { display: 'block', marginTop: '12px', marginBottom: '6px', fontWeight: 600, fontSize: '14px' };
const formInputStyle = { width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' };
const modalButtonsStyle = { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' };
const cancelButtonStyle = { backgroundColor: '#e2e8f0', color: '#1e293b', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer' };

export default JobVacancies;