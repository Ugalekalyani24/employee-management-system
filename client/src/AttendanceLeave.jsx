import React, { useState, useEffect } from 'react';

const AttendanceLeave = () => {
  const [punchedIn, setPunchedIn] = useState(false);
  const [punchTime, setPunchTime] = useState(null);
  const [leaveType, setLeaveType] = useState('Casual Leave');
  const [reason, setReason] = useState('');
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [leaveBalance, setLeaveBalance] = useState({ casual: 8, sick: 5, paid: 12 });

  const currentUser = JSON.parse(localStorage.getItem('user')) || { id: 1, email: 'user@company.com', role: 'admin' };

  // Fetch Leaves
  const fetchLeaves = async () => {
    try {
      const res = await fetch('https://employee-management-system-p1ci.onrender.com/api/leaves');
      if (res.ok) {
        const data = await res.json();
        setLeaveRequests(data);
      }
    } catch (err) {
      console.error('Failed to load leaves:', err);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  // Punch In/Out Action
  const handlePunch = async () => {
    const type = punchedIn ? 'out' : 'in';
    try {
      const res = await fetch('https://employee-management-system-p1ci.onrender.com/api/attendance/punch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, type }),
      });
      const data = await res.json();
      if (res.ok) {
        setPunchedIn(!punchedIn);
        setPunchTime(type === 'in' ? data.punchIn : data.punchOut);
      }
    } catch (err) {
      alert('Punch Failed! Check backend.');
    }
  };

  // Submit Leave Request
  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('https://employee-management-system-p1ci.onrender.com/api/leaves/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          userEmail: currentUser.email,
          leaveType,
          reason,
        }),
      });
      if (res.ok) {
        setReason('');
        fetchLeaves();
      }
    } catch (err) {
      alert('Failed to submit request');
    }
  };

  // Admin One-Click Action (Approve / Reject)
  const handleStatusUpdate = async (id, status) => {
    try {
      const res = await fetch(`https://employee-management-system-p1ci.onrender.com/api/leaves/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        fetchLeaves();
      }
    } catch (err) {
      alert('Action Failed');
    }
  };

  return (
    <div style={styles.container}>
      <h2>Attendance & Leave Tracker</h2>

      {/* 1. Punch In / Out Section */}
      <div style={styles.card}>
        <h3>Daily Attendance Punch</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button
            onClick={handlePunch}
            style={{
              ...styles.punchBtn,
              backgroundColor: punchedIn ? '#dc2626' : '#16a34a',
            }}
          >
            {punchedIn ? '🔴 Punch Out' : '🟢 Punch In'}
          </button>
          {punchTime && (
            <p>
              Last {punchedIn ? 'Punch In' : 'Punch Out'} at: <strong>{punchTime}</strong>
            </p>
          )}
        </div>
      </div>

      {/* 2. Leave Balance Display */}
      <div style={styles.card}>
        <h3>Total Remaining Leave Balance</h3>
        <div style={styles.balanceGrid}>
          <div style={styles.balanceBox}>
            <span>Casual Leave</span>
            <h4>{leaveBalance.casual} Days</h4>
          </div>
          <div style={styles.balanceBox}>
            <span>Sick Leave</span>
            <h4>{leaveBalance.sick} Days</h4>
          </div>
          <div style={styles.balanceBox}>
            <span>Paid Leave</span>
            <h4>{leaveBalance.paid} Days</h4>
          </div>
        </div>
      </div>

      {/* 3. Leave Request Form */}
      <div style={styles.card}>
        <h3>Apply For Leave</h3>
        <form onSubmit={handleLeaveSubmit} style={styles.form}>
          <select
            value={leaveType}
            onChange={(e) => setLeaveType(e.target.value)}
            style={styles.input}
          >
            <option value="Casual Leave">Casual Leave</option>
            <option value="Sick Leave">Sick Leave</option>
            <option value="Paid Leave">Paid Leave</option>
          </select>

          <input
            type="text"
            placeholder="Reason for Leave"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
            style={styles.input}
          />

          <button type="submit" style={styles.submitBtn}>
            Submit Leave Request
          </button>
        </form>
      </div>

      {/* 4. Requests & Admin One-Click Controls */}
      <div style={styles.card}>
        <h3>Leave Requests Management</h3>
        <table style={styles.table}>
          <thead>
            <tr style={{ textAlign: 'left', backgroundColor: '#f1f5f9' }}>
              <th style={styles.th}>Employee</th>
              <th style={styles.th}>Type</th>
              <th style={styles.th}>Reason</th>
              <th style={styles.th}>Status</th>
              {currentUser.role === 'admin' && <th style={styles.th}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {leaveRequests.map((req) => (
              <tr key={req.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={styles.td}>{req.userEmail}</td>
                <td style={styles.td}>{req.leaveType}</td>
                <td style={styles.td}>{req.reason}</td>
                <td style={styles.td}>
                  <span
                    style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      backgroundColor:
                        req.status === 'Approved'
                          ? '#dcfce7'
                          : req.status === 'Rejected'
                          ? '#fee2e2'
                          : '#fef3c7',
                      color:
                        req.status === 'Approved'
                          ? '#15803d'
                          : req.status === 'Rejected'
                          ? '#b91c1c'
                          : '#b45309',
                    }}
                  >
                    {req.status}
                  </span>
                </td>

                {/* Admin Controls */}
                {currentUser.role === 'admin' && (
                  <td style={styles.td}>
                    {req.status === 'Pending' ? (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => handleStatusUpdate(req.id, 'Approved')}
                          style={styles.approveBtn}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(req.id, 'Rejected')}
                          style={styles.rejectBtn}
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span>Completed</span>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: '20px' },
  card: { backgroundColor: '#fff', padding: '20px', borderRadius: '10px', border: '1px solid #e2e8f0' },
  punchBtn: { padding: '12px 24px', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
  balanceGrid: { display: 'flex', gap: '16px', marginTop: '10px' },
  balanceBox: { flex: 1, padding: '15px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' },
  form: { display: 'flex', gap: '12px', marginTop: '10px' },
  input: { flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' },
  submitBtn: { padding: '10px 20px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' },
  table: { width: '100%', borderCollapse: 'collapse', marginTop: '10px' },
  th: { padding: '12px' },
  td: { padding: '12px' },
  approveBtn: { padding: '6px 12px', backgroundColor: '#16a34a', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  rejectBtn: { padding: '6px 12px', backgroundColor: '#dc2626', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' },
};

export default AttendanceLeave;