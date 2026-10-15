import React, { useState } from 'react';

const Payroll = () => {
  const [payrolls, setPayrolls] = useState([
    { id: 1, name: 'Shubham Kokane', month: 'October 2026', basic: '₹75,000', hra: '₹18,000', tax: '₹3,500', netPay: '₹1,10,500', status: 'Paid' },
    { id: 2, name: 'Neha Kadam', month: 'October 2026', basic: '₹50,000', hra: '₹10,000', tax: '₹3,000', netPay: '₹57,000', status: 'Paid' },
    { id: 3, name: 'Pranali Shelar', month: 'October 2026', basic: '₹48,000', hra: '₹9,600', tax: '₹2,800', netPay: '₹54,800', status: 'Pending' },
    { id: 4, name: 'Sakshi Chavan', month: 'October 2026', basic: '₹45,000', hra: '₹9,000', tax: '₹2,500', netPay: '₹51,500', status: 'Paid' },
    { id: 5, name: 'Siddhi Ugale', month: 'October 2026', basic: '₹52,000', hra: '₹10,400', tax: '₹3,200', netPay: '₹59,200', status: 'Paid' }
  ]);

  const [formData, setFormData] = useState({ empId: '', name: '', salary: '' });

  const handleGeneratePayroll = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.salary) return;

    const basicNum = Number(formData.salary) || 0;
    const hraNum = Math.round(basicNum * 0.2);
    const taxNum = Math.round(basicNum * 0.05);
    const netNum = basicNum + hraNum - taxNum;

    const newRecord = {
      id: payrolls.length + 1,
      name: formData.name,
      month: 'October 2026',
      basic: `₹${basicNum.toLocaleString('en-IN')}`,
      hra: `₹${hraNum.toLocaleString('en-IN')}`,
      tax: `₹${taxNum.toLocaleString('en-IN')}`,
      netPay: `₹${netNum.toLocaleString('en-IN')}`,
      status: 'Paid'
    };

    setPayrolls([newRecord, ...payrolls]);
    setFormData({ empId: '', name: '', salary: '' });
    alert('Payroll calculated and added!');
  };

  return (
    <div style={containerStyle}>
      <h2>Payroll & Salary Slip Generator</h2>

      {/* Calculator Section */}
      <div style={cardStyle}>
        <h3>Calculate & Process Monthly Salary</h3>
        <form onSubmit={handleGeneratePayroll} style={formStyle}>
          <input
            type="text"
            placeholder="Employee ID"
            value={formData.empId}
            onChange={(e) => setFormData({ ...formData, empId: e.target.value })}
            style={inputStyle}
          />
          <input
            type="text"
            placeholder="Employee Name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            style={inputStyle}
          />
          <input
            type="number"
            placeholder="Basic Salary (₹)"
            required
            value={formData.salary}
            onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
            style={inputStyle}
          />
          <button type="submit" style={buttonStyle}>Generate Payroll</button>
        </form>
      </div>

      {/* Salary Table */}
      <div style={cardStyle}>
        <h3>Salary Processing & Payslips</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={tableStyle}>
            <thead>
              <tr style={{ backgroundColor: '#f1f5f9', textAlign: 'left' }}>
                <th style={thStyle}>Employee</th>
                <th style={thStyle}>Month</th>
                <th style={thStyle}>Basic</th>
                <th style={thStyle}>HRA / DA</th>
                <th style={thStyle}>Tax</th>
                <th style={thStyle}>Net Pay</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payrolls.map((row) => (
                <tr key={row.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={tdStyle}><strong>{row.name}</strong></td>
                  <td style={tdStyle}>{row.month}</td>
                  <td style={tdStyle}>{row.basic}</td>
                  <td style={tdStyle}>{row.hra}</td>
                  <td style={tdStyle}>{row.tax}</td>
                  <td style={tdStyle}><strong>{row.netPay}</strong></td>
                  <td style={tdStyle}>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      backgroundColor: row.status === 'Paid' ? '#dcfce7' : '#fef3c7',
                      color: row.status === 'Paid' ? '#15803d' : '#b45309'
                    }}>
                      {row.status}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <button onClick={() => alert(`Downloading Payslip PDF for ${row.name}`)} style={downloadBtnStyle}>
                      📄 Download Payslip
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Styles
const containerStyle = { padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', color: '#1e293b' };
const cardStyle = { backgroundColor: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' };
const formStyle = { display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '12px' };
const inputStyle = { flex: 1, minWidth: '180px', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' };
const buttonStyle = { backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 };
const tableStyle = { width: '100%', borderCollapse: 'collapse', marginTop: '12px' };
const thStyle = { padding: '12px' };
const tdStyle = { padding: '12px', fontSize: '14px' };
const downloadBtnStyle = { backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' };

export default Payroll;