import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';

const Payroll = () => {
  const [payrollList, setPayrollList] = useState([]);
  const [formData, setFormData] = useState({
    employeeId: '',
    employeeName: '',
    month: 'October 2026',
    basicSalary: '',
  });

  const currentUser = JSON.parse(localStorage.getItem('user')) || { role: 'admin' };

  const fetchPayroll = async () => {
    try {
      const res = await fetch('https://employee-management-system-p1ci.onrender.com/api/payroll');
      if (res.ok) {
        const data = await res.json();
        setPayrollList(data);
      }
    } catch (err) {
      console.error('Failed to load payroll:', err);
    }
  };

  useEffect(() => {
    fetchPayroll();
  }, []);

  const handleGeneratePayroll = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('https://employee-management-system-p1ci.onrender.com/api/payroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        setFormData({ employeeId: '', employeeName: '', month: 'October 2026', basicSalary: '' });
        fetchPayroll();
      } else {
        alert(data.error || data.message || 'Error generating payroll');
      }
    } catch (err) {
      alert('Backend server not reachable. Please start server on port 5000.');
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      const res = await fetch(`https://employee-management-system-p1ci.onrender.com/api/payroll/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) fetchPayroll();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  // PDF Salary Slip Generator
  const downloadPDF = (item) => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('COMPANY SALARY PAYSLIP', 14, 20);

    doc.setFontSize(11);
    doc.text(`Employee Name: ${item.employeeName}`, 14, 35);
    doc.text(`Employee ID: ${item.employeeId}`, 14, 42);
    doc.text(`Pay Month: ${item.month}`, 14, 49);
    doc.text(`Payment Status: ${item.status}`, 14, 56);

    doc.line(14, 62, 196, 62);

    doc.text('Earnings & Deductions Breakdown', 14, 72);
    doc.text(`Basic Salary: ₹${item.basicSalary.toFixed(2)}`, 14, 82);
    doc.text(`HRA (20%): ₹${item.hra.toFixed(2)}`, 14, 90);
    doc.text(`DA (10%): ₹${item.da.toFixed(2)}`, 14, 98);
    doc.text(`Tax Deduction (10%): -₹${item.taxDeduction.toFixed(2)}`, 14, 106);

    doc.line(14, 112, 196, 112);

    doc.setFontSize(14);
    doc.text(`Net Payable Amount: ₹${item.netPay.toFixed(2)}`, 14, 124);

    doc.save(`Payslip_${item.employeeName}_${item.month}.pdf`);
  };

  return (
    <div style={styles.container}>
      <h2>Payroll & Salary Slip Generator</h2>

      {/* 1. Admin Form to Generate Payroll */}
      {currentUser.role === 'admin' && (
        <div style={styles.card}>
          <h3>Calculate & Process Monthly Salary</h3>
          <form onSubmit={handleGeneratePayroll} style={styles.form}>
            <input
              type="text"
              placeholder="Employee ID"
              value={formData.employeeId}
              onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
              required
              style={styles.input}
            />
            <input
              type="text"
              placeholder="Employee Name"
              value={formData.employeeName}
              onChange={(e) => setFormData({ ...formData, employeeName: e.target.value })}
              required
              style={styles.input}
            />
            <input
              type="number"
              placeholder="Basic Salary (₹)"
              value={formData.basicSalary}
              onChange={(e) => setFormData({ ...formData, basicSalary: e.target.value })}
              required
              style={styles.input}
            />
            <button type="submit" style={styles.submitBtn}>
              Generate Payroll
            </button>
          </form>
        </div>
      )}

      {/* 2. Payroll Table */}
      <div style={styles.card}>
        <h3>Salary Processing & Payslips</h3>
        <table style={styles.table}>
          <thead>
            <tr style={{ textAlign: 'left', backgroundColor: '#f1f5f9' }}>
              <th style={styles.th}>Employee</th>
              <th style={styles.th}>Month</th>
              <th style={styles.th}>Basic</th>
              <th style={styles.th}>HRA / DA</th>
              <th style={styles.th}>Tax</th>
              <th style={styles.th}>Net Pay</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {payrollList.map((item) => (
              <tr key={item.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={styles.td}>
                  <strong>{item.employeeName}</strong> <br />
                  <small style={{ color: '#64748b' }}>ID: {item.employeeId}</small>
                </td>
                <td style={styles.td}>{item.month}</td>
                <td style={styles.td}>₹{item.basicSalary}</td>
                <td style={styles.td}>₹{item.hra + item.da}</td>
                <td style={styles.td}>-₹{item.taxDeduction}</td>
                <td style={styles.td}>
                  <strong>₹{item.netPay}</strong>
                </td>
                <td style={styles.td}>
                  <span
                    style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      backgroundColor: item.status === 'Paid' ? '#dcfce7' : '#fef3c7',
                      color: item.status === 'Paid' ? '#15803d' : '#b45309',
                    }}
                  >
                    {item.status}
                  </span>
                </td>
                <td style={styles.td}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => downloadPDF(item)} style={styles.pdfBtn}>
                      📄 Download PDF
                    </button>
                    {currentUser.role === 'admin' && (
                      <button
                        onClick={() =>
                          handleStatusChange(item.id, item.status === 'Paid' ? 'Pending' : 'Paid')
                        }
                        style={styles.toggleBtn}
                      >
                        Mark as {item.status === 'Paid' ? 'Pending' : 'Paid'}
                      </button>
                    )}
                  </div>
                </td>
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
  form: { display: 'flex', gap: '12px', marginTop: '10px', flexWrap: 'wrap' },
  input: { flex: 1, minWidth: '150px', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' },
  submitBtn: { padding: '10px 20px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' },
  table: { width: '100%', borderCollapse: 'collapse', marginTop: '10px' },
  th: { padding: '12px' },
  td: { padding: '12px' },
  pdfBtn: { padding: '6px 12px', backgroundColor: '#059669', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' },
  toggleBtn: { padding: '6px 12px', backgroundColor: '#475569', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' },
};

export default Payroll;