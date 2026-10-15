import React, { useState } from 'react';

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState([
    { id: 1, name: 'Shubham Kokane', email: 'shubham.k@company.com', department: 'IT', role: 'Full Stack Developer', salary: 55000 },
    { id: 2, name: 'Neha Kadam', email: 'neha@company.com', department: 'HR', role: 'HR Manager', salary: 50000 },
    { id: 3, name: 'Pranali Shelar', email: 'pranali@company.com', department: 'IT', role: 'Frontend Developer', salary: 48000 },
    { id: 4, name: 'Sakshi Chavan', email: 'sakshi@company.com', department: 'Finance', role: 'Accountant', salary: 45000 },
    { id: 5, name: 'Siddhi Ugale', email: 'siddhi@company.com', department: 'IT', role: 'Backend Developer', salary: 52000 },
    { id: 6, name: 'Kritika Salunkhe', email: 'kritika@company.com', department: 'Sales', role: 'Sales Executive', salary: 42000 },
    { id: 7, name: 'Bhakti Jagdale', email: 'bhakti@company.com', department: 'HR', role: 'Recruiter', salary: 40000 },
    { id: 8, name: 'Aditya Verma', email: 'aditya@company.com', department: 'IT', role: 'UI/UX Designer', salary: 46000 },
    { id: 9, name: 'Priya Sharma', email: 'priya@company.com', department: 'Finance', role: 'Financial Analyst', salary: 49000 },
    { id: 10, name: 'Rohan Patil', email: 'rohan@company.com', department: 'Sales', role: 'Sales Manager', salary: 58000 },
    { id: 11, name: 'Ananya Deshmukh', email: 'ananya@company.com', department: 'IT', role: 'QA Engineer', salary: 44000 }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    department: 'IT',
    salary: ''
  });

  // Search & Department Filter
  const filteredEmployees = employees.filter((emp) => {
    const name = (emp.name || '').toLowerCase();
    const email = (emp.email || '').toLowerCase();
    const search = searchTerm.toLowerCase();

    const matchesSearch = name.includes(search) || email.includes(search);
    const matchesDept = selectedDept === 'All' || emp.department === selectedDept;

    return matchesSearch && matchesDept;
  });

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const safePage = Math.min(currentPage, Math.max(totalPages, 1));
  const indexOfLastItem = safePage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredEmployees.slice(indexOfFirstItem, indexOfLastItem);

  const handleAddEmployee = (e) => {
    e.preventDefault();
    const newEmp = {
      id: employees.length + 1,
      ...formData,
      salary: Number(formData.salary) || 0
    };
    setEmployees([newEmp, ...employees]);
    setShowModal(false);
    setFormData({ name: '', email: '', role: '', department: 'IT', salary: '' });
    alert('Employee added successfully!');
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <div>
          <h2 style={{ margin: 0 }}>Employee Management</h2>
          <p style={{ color: '#64748b', marginTop: 8 }}>Manage employee records and information</p>
        </div>
        <button onClick={() => setShowModal(true)} style={addButtonStyle}>
          + Add Employee
        </button>
      </div>

      <div style={filterContainerStyle}>
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={inputStyle}
        />
        <select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)} style={inputStyle}>
          <option value="All">All Departments</option>
          <option value="IT">IT</option>
          <option value="HR">HR</option>
          <option value="Sales">Sales</option>
          <option value="Finance">Finance</option>
        </select>
      </div>

      <div style={tableWrapperStyle}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Employee ID</th>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Department</th>
              <th style={thStyle}>Role</th>
              <th style={thStyle}>Salary</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ ...tdStyle, textAlign: 'center' }}>
                  No employees found.
                </td>
              </tr>
            ) : (
              currentItems.map((emp, index) => (
                <tr key={emp.id}>
                  <td style={tdStyle}>EMP-{String(indexOfFirstItem + index + 1).padStart(4, '0')}</td>
                  <td style={tdStyle}>{emp.name}</td>
                  <td style={tdStyle}>{emp.email}</td>
                  <td style={tdStyle}>{emp.department}</td>
                  <td style={tdStyle}>{emp.role}</td>
                  <td style={tdStyle}>₹{Number(emp.salary || 0).toLocaleString('en-IN')}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div style={paginationStyle}>
        <span>Total Employees: {filteredEmployees.length}</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={safePage === 1}
            style={pageButtonStyle}
          >
            Previous
          </button>
          <span style={{ padding: '8px 4px' }}>Page {safePage} of {Math.max(totalPages, 1)}</span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage >= totalPages || totalPages === 0}
            style={pageButtonStyle}
          >
            Next
          </button>
        </div>
      </div>

      {showModal && (
        <div style={modalOverlayStyle}>
          <div style={modalStyle}>
            <h2 style={{ marginTop: 0 }}>Add New Employee</h2>
            <form onSubmit={handleAddEmployee}>
              <label style={labelStyle}>Full Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                style={formInputStyle}
                placeholder="Enter employee name"
              />
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                style={formInputStyle}
                placeholder="Enter email address"
              />
              <label style={labelStyle}>Department</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                style={formInputStyle}
              >
                <option value="IT">IT</option>
                <option value="HR">HR</option>
                <option value="Sales">Sales</option>
                <option value="Finance">Finance</option>
              </select>
              <label style={labelStyle}>Role</label>
              <input
                type="text"
                required
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                style={formInputStyle}
                placeholder="Enter job role"
              />
              <label style={labelStyle}>Monthly Salary (₹)</label>
              <input
                type="number"
                min="0"
                required
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                style={formInputStyle}
                placeholder="Enter salary"
              />
              <div style={modalButtonsStyle}>
                <button type="button" onClick={() => setShowModal(false)} style={cancelButtonStyle}>
                  Cancel
                </button>
                <button type="submit" style={addButtonStyle}>
                  Save Employee
                </button>
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
const filterContainerStyle = { display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' };
const inputStyle = { padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', minWidth: '220px', backgroundColor: '#ffffff', color: '#1e293b' };
const tableWrapperStyle = { width: '100%', overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '10px' };
const tableStyle = { width: '100%', minWidth: '760px', borderCollapse: 'collapse', backgroundColor: '#ffffff' };
const thStyle = { textAlign: 'left', padding: '14px 12px', backgroundColor: '#f1f5f9', color: '#334155', borderBottom: '1px solid #e2e8f0' };
const tdStyle = { padding: '13px 12px', borderBottom: '1px solid #e2e8f0', fontSize: '14px' };
const paginationStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginTop: '18px' };
const pageButtonStyle = { padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', backgroundColor: '#ffffff', cursor: 'pointer' };
const modalOverlayStyle = { position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.55)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '16px', zIndex: 1000 };
const modalStyle = { backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', width: '100%', maxWidth: '480px', boxShadow: '0 20px 25px rgba(0, 0, 0, 0.15)' };
const labelStyle = { display: 'block', marginTop: '12px', marginBottom: '6px', fontWeight: 600, fontSize: '14px' };
const formInputStyle = { width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' };
const modalButtonsStyle = { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' };
const cancelButtonStyle = { backgroundColor: '#e2e8f0', color: '#1e293b', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer' };

export default EmployeeManagement;