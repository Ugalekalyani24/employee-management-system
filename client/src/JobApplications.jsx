import React, { useState, useEffect } from 'react';


const JobApplications = () => {
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    fetch('https://employee-management-system-1-6sdi.onrender.com/api/applications')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch applications');
        }
        return response.json();
      })
      .then((data) => {
        setApplications(
          data.map((app) => ({
            ...app,
            id: `APP-${String(app.id).padStart(3, '0')}`,
            dbId: app.id,
            name: app.applicantName
          }))
        );
      })
      .catch((error) => {
        console.error('Error loading applications:', error);
      });
  },
   []);
    const updateStatus = async (id, newStatus) => {
    const app = applications.find((item) => item.id === id);

    if (!app) return;

    try {
      const response = await fetch(
        `https://employee-management-system-1-6sdi.onrender.com/api/applications/${app.dbId}/status`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status: newStatus })
        }
      );

      if (!response.ok) {
        throw new Error('Status update failed');
      }

      setApplications((prevApplications) =>
        prevApplications.map((item) =>
          item.id === id
            ? { ...item, status: newStatus }
            : item
        )
      );

      alert('Application status updated successfully!');
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Status update failed. Please try again.');
    }
  };


  return (
    <div style={{ width: '100%' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a', marginBottom: '24px' }}>Job Applications</h1>

      <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>Applicant Name</th>
              <th style={thStyle}>Position</th>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Change Status</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
              <tr key={app.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={tdStyle}>{app.id}</td>
                <td style={{ ...tdStyle, fontWeight: 'bold' }}>{app.name}</td>
                <td style={tdStyle}>{app.position}</td>
                <td style={tdStyle}>{app.email}</td>
                <td style={tdStyle}>
                  <span style={{ backgroundColor: '#fef3c7', color: '#d97706', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>{app.status}</span>
                </td>
                <td style={tdStyle}>
                  <button onClick={() => updateStatus(app.id, 'Shortlisted')} style={{ marginRight: '8px', color: '#16a34a', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Shortlist</button>
                  <button onClick={() => updateStatus(app.id, 'Rejected')} style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Reject</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const thStyle = { padding: '14px 16px', fontSize: '13px', color: '#475569', fontWeight: 'bold' };
const tdStyle = { padding: '14px 16px', fontSize: '14px', color: '#1e293b' };

export default JobApplications;