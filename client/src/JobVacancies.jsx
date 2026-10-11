
import React, { useState, useEffect } from 'react';

const STORAGE_KEY = 'ems_vacancies';

const emptyForm = {
  title: '',
  department: '',
  location: '',
  salary: '',
  status: 'Open'
};

const JobVacancies = () => {
  const [vacancies, setVacancies] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setVacancies(parsed);
        }
      }
    } catch (err) {
      console.error('Could not load saved vacancies:', err);
      setError('Saved job vacancies could not be loaded.');
    }
  }, []);

  const handlePostJob = (e) => {
    e.preventDefault();
    setError('');

    const title = formData.title.trim();
    const department = formData.department.trim();
    const location = formData.location.trim();
    const salary = formData.salary.trim();

    if (!title || !department || !location || !salary) {
      setError('Please fill in all fields.');
      return;
    }

    const newJob = {
      ...formData,
      title,
      department,
      location,
      salary,
      status: 'Open',
      id: `JOB-${Date.now()}`
    };

    const updated = [...vacancies, newJob];

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setVacancies(updated);
      setFormData(emptyForm);
      setShowModal(false);
      setError('');
    } catch (err) {
      console.error('Could not save job:', err);
      setError('Job could not be saved. Please try again.');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData(emptyForm);
    setError('');
  };

  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <div>
          <h1 style={headingStyle}>Job Vacancies</h1>
          <p style={subtitleStyle}>
            Create and manage available job positions.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setError('');
            setShowModal(true);
          }}
          style={primaryButtonStyle}
        >
          + Post New Job
        </button>
      </div>

      {error && !showModal && (
        <p role="alert" style={errorStyle}>{error}</p>
      )}

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
            {vacancies.length === 0 ? (
              <tr>
                <td colSpan={6} style={emptyStyle}>
                  No job vacancies posted yet.
                  <br />
                  Click "Post New Job" to add your first vacancy.
                </td>
              </tr>
            ) : (
              vacancies.map((job) => (
                <tr key={job.id}>
                  <td style={tdStyle}>{job.id}</td>
                  <td style={{ ...tdStyle, fontWeight: 600 }}>
                    {job.title}
                  </td>
                  <td style={tdStyle}>{job.department}</td>
                  <td style={tdStyle}>{job.location}</td>
                  <td style={tdStyle}>{job.salary}</td>
                  <td style={tdStyle}>
                    <span style={statusStyle}>
                      {job.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p style={countStyle}>
        Total vacancies: {vacancies.length}
      </p>

      {showModal && (
        <div style={overlayStyle}>
          <div
            style={modalStyle}
            role="dialog"
            aria-modal="true"
            aria-labelledby="job-modal-title"
          >
            <h2 id="job-modal-title" style={modalHeadingStyle}>
              Post New Job Vacancy
            </h2>

            <form onSubmit={handlePostJob}>
              <label style={labelStyle}>Job Title</label>
              <input
                type="text"
                placeholder="e.g. Frontend Developer"
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    title: e.target.value
                  })
                }
                style={inputStyle}
              />

              <label style={labelStyle}>Department</label>
              <select
                required
                value={formData.department}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    department: e.target.value
                  })
                }
                style={inputStyle}
              >
                <option value="">Select Department</option>
                <option value="IT">IT</option>
                <option value="HR">HR</option>
                <option value="Sales">Sales</option>
                <option value="Finance">Finance</option>
                <option value="Marketing">Marketing</option>
              </select>

              <label style={labelStyle}>Location</label>
              <input
                type="text"
                placeholder="e.g. Mumbai or Remote"
                required
                value={formData.location}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    location: e.target.value
                  })
                }
                style={inputStyle}
              />

              <label style={labelStyle}>Salary Range</label>
              <input
                type="text"
                placeholder="e.g. ₹5–8 LPA"
                required
                value={formData.salary}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    salary: e.target.value
                  })
                }
                style={inputStyle}
              />

              {error && (
                <p role="alert" style={errorStyle}>{error}</p>
              )}

              <div style={buttonRowStyle}>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  style={cancelButtonStyle}
                >
                  Cancel
                </button>

                <button type="submit" style={primaryButtonStyle}>
                  Publish Job
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const pageStyle = {
  width: '100%',
  minWidth: 0,
  boxSizing: 'border-box'
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '16px',
  marginBottom: '24px'
};

const headingStyle = {
  fontSize: '24px',
  fontWeight: 700,
  color: '#0f172a',
  margin: '0 0 8px'
};

const subtitleStyle = {
  color: '#64748b',
  fontSize: '14px',
  margin: 0
};

const primaryButtonStyle = {
  backgroundColor: '#2563eb',
  color: '#fff',
  padding: '10px 18px',
  border: 'none',
  borderRadius: '8px',
  fontWeight: 600,
  cursor: 'pointer'
};

const tableWrapperStyle = {
  width: '100%',
  overflowX: 'auto',
  backgroundColor: '#fff',
  borderRadius: '12px',
  border: '1px solid #e2e8f0'
};

const tableStyle = {
  width: '100%',
  minWidth: '760px',
  borderCollapse: 'collapse',
  textAlign: 'left'
};

const thStyle = {
  padding: '14px 16px',
  fontSize: '13px',
  color: '#475569',
  fontWeight: 700,
  backgroundColor: '#f8fafc',
  borderBottom: '1px solid #e2e8f0',
  whiteSpace: 'nowrap'
};

const tdStyle = {
  padding: '14px 16px',
  fontSize: '14px',
  color: '#1e293b',
  borderBottom: '1px solid #f1f5f9',
  whiteSpace: 'nowrap'
};

const emptyStyle = {
  padding: '40px 20px',
  textAlign: 'center',
  color: '#94a3b8',
  lineHeight: 2
};

const statusStyle = {
  display: 'inline-block',
  backgroundColor: '#dcfce7',
  color: '#15803d',
  padding: '4px 10px',
  borderRadius: '12px',
  fontSize: '12px',
  fontWeight: 700
};

const countStyle = {
  color: '#64748b',
  fontSize: '14px',
  marginTop: '16px'
};

const overlayStyle = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(15, 23, 42, 0.55)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '16px',
  boxSizing: 'border-box',
  zIndex: 1000,
  overflowY: 'auto'
};

const modalStyle = {
  backgroundColor: '#fff',
  padding: '24px',
  borderRadius: '12px',
  width: '100%',
  maxWidth: '440px',
  maxHeight: '90vh',
  overflowY: 'auto',
  boxSizing: 'border-box',
  boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
};

const modalHeadingStyle = {
  margin: '0 0 20px',
  fontSize: '20px',
  color: '#0f172a'
};

const labelStyle = {
  display: 'block',
  margin: '12px 0 6px',
  color: '#334155',
  fontSize: '14px',
  fontWeight: 600
};

const inputStyle = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '11px 12px',
  borderRadius: '7px',
  border: '1px solid #cbd5e1',
  fontSize: '14px',
  backgroundColor: '#fff',
  color: '#1e293b'
};

const buttonRowStyle = {
  display: 'flex',
  justifyContent: 'flex-end',
  flexWrap: 'wrap',
  gap: '10px',
  marginTop: '24px'
};

const cancelButtonStyle = {
  padding: '10px 16px',
  borderRadius: '7px',
  border: '1px solid #cbd5e1',
  backgroundColor: '#fff',
  cursor: 'pointer'
};

const errorStyle = {
  color: '#b91c1c',
  backgroundColor: '#fef2f2',
  padding: '10px 12px',
  borderRadius: '7px',
  fontSize: '14px'
};

export default JobVacancies;
