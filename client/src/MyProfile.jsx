import React from 'react';

const MyProfile = ({ user }) => {
  return (
    <div style={{ width: '100%' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a', marginBottom: '20px' }}>My Profile</h1>
      
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0', maxWidth: '600px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold' }}>
            {user?.name ? user.name[0].toUpperCase() : 'E'}
          </div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>{user?.name || 'Employee Name'}</h2>
            <p style={{ color: '#64748b', margin: '4px 0 0' }}>{user?.role || 'Employee'}</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
          <div>
            <label style={labelStyle}>Employee ID</label>
            <p style={valueStyle}>{user?.id || 'EMP-1002'}</p>
          </div>
          <div>
            <label style={labelStyle}>Email Address</label>
            <p style={valueStyle}>{user?.email || 'employee@company.com'}</p>
          </div>
          <div>
            <label style={labelStyle}>Department</label>
            <p style={valueStyle}>{user?.department || 'Engineering'}</p>
          </div>
          <div>
            <label style={labelStyle}>Designation</label>
            <p style={valueStyle}>{user?.designation || 'Software Engineer'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const labelStyle = { fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold' };
const valueStyle = { fontSize: '14px', color: '#0f172a', fontWeight: '600', marginTop: '4px' };

export default MyProfile;