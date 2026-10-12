
import React, { useState, useEffect } from 'react';

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState([]);
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

  // Required employee display order
  const desiredOrder = [
    'Shubham Kokane',
    'Neha Kadam',
    'Pranali Shelar',
    'Sakshi Chavan',
    'Siddhi Ugale',
    'Kritika Salunkhe',
    'Bhakti Jagdale',
    'Aditya Verma',
    'Priya Sharma',
    'Rohan Patil',
    'Ananya Deshmukh'
  ];

  // Sort employees in the required order
  const sortEmployees = (employeeList) => {
    return [...employeeList].sort((a, b) => {
      const aIndex = desiredOrder.indexOf(a.name);
      const bIndex = desiredOrder.indexOf(b.name);

      if (aIndex === -1 && bIndex === -1) {
        return (a.name || '').localeCompare(b.name || '');
      }

      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;

      return aIndex - bIndex;
    });
  };

  // Fetch employees from backend
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch(
          'https://employee-management-system-p1ci.onrender.com/api/employees'
        );

        if (!response.ok) {
          throw new Error('Failed to fetch employees');
        }

        const data = await response.json();
        setEmployees(sortEmployees(data));
      } catch (error) {
        console.error('Error fetching employees:', error);
      }
    };

    fetchEmployees();
  }, []);

  // Search and department filter
  const filteredEmployees = employees.filter((emp) => {
    const name = (emp.name || '').toLowerCase();
    const email = (emp.email || '').toLowerCase();
    const id = String(emp.id ?? '').toLowerCase();
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      name.includes(search) ||
      email.includes(search) ||
      id.includes(search);

    const matchesDept =
      selectedDept === 'All' ||
      emp.department === selectedDept;

    return matchesSearch && matchesDept;
  });

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedDept]);

  // Pagination
  const totalPages = Math.ceil(
    filteredEmployees.length / itemsPerPage
  );

  const safePage = Math.min(
    currentPage,
    Math.max(totalPages, 1)
  );

  const indexOfLastItem = safePage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const currentItems = filteredEmployees.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  // Add employee to database
  const handleAddEmployee = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('https://employee-management-system-1-6sdi.onrender.com/api/auth/login', {
        
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ...formData,
            salary: Number(formData.salary) || 0
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        throw new Error(
          errorData.error || 'Failed to save employee'
        );
      }

      const savedEmployee = await response.json();

      setEmployees((previousEmployees) =>
        sortEmployees([...previousEmployees, savedEmployee])
      );

      setShowModal(false);

      setFormData({
        name: '',
        email: '',
        role: '',
        department: 'IT',
        salary: ''
      });

      alert('Employee added successfully!');
    } catch (error) {
      console.error('Add employee error:', error);
      alert(error.message || 'Employee save failed. Check backend.');
    }
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <div>
          <h2 style={{ margin: 0 }}>Employee Management</h2>
          <p style={{ color: '#64748b', marginTop: 8 }}>
            Manage employee records and information
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          style={addButtonStyle}
        >
          + Add Employee
        </button>
      </div>

      <div style={filterContainerStyle}>
        <input
          type="text"
          placeholder="Search by name, email or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={inputStyle}
        />

        <select
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          style={inputStyle}
        >
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
                <td
                  colSpan={6}
                  style={{ ...tdStyle, textAlign: 'center' }}
                >
                  No employees found.
                </td>
              </tr>
            ) : (
              currentItems.map((emp, index) => (
                <tr key={emp.id}>
                  <td style={tdStyle}>
                    EMP-
                    {String(indexOfFirstItem + index + 1).padStart(4, '0')}
                  </td>

                  <td style={tdStyle}>{emp.name}</td>
                  <td style={tdStyle}>{emp.email}</td>
                  <td style={tdStyle}>{emp.department}</td>
                  <td style={tdStyle}>{emp.role}</td>

                  <td style={tdStyle}>
                    ₹{Number(emp.salary || 0).toLocaleString('en-IN')}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div style={paginationStyle}>
        <span>
          Total Employees: {filteredEmployees.length}
        </span>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() =>
              setCurrentPage((page) => Math.max(1, page - 1))
            }
            disabled={safePage === 1}
            style={pageButtonStyle}
          >
            Previous
          </button>

          <span style={{ padding: '8px 4px' }}>
            Page {safePage} of {Math.max(totalPages, 1)}
          </span>

          <button
            onClick={() =>
              setCurrentPage((page) =>
                Math.min(Math.max(totalPages, 1), page + 1)
              )
            }
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
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    name: e.target.value
                  })
                }
                style={formInputStyle}
                placeholder="Enter employee name"
              />

              <label style={labelStyle}>Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    email: e.target.value
                  })
                }
                style={formInputStyle}
                placeholder="Enter email address"
              />

              <label style={labelStyle}>Department</label>
              <select
                value={formData.department}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    department: e.target.value
                  })
                }
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
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    role: e.target.value
                  })
                }
                style={formInputStyle}
                placeholder="Enter job role"
              />

              <label style={labelStyle}>Monthly Salary (₹)</label>
              <input
                type="number"
                min="0"
                required
                value={formData.salary}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    salary: e.target.value
                  })
                }
                style={formInputStyle}
                placeholder="Enter salary"
              />

              <div style={modalButtonsStyle}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={cancelButtonStyle}
                >
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
const containerStyle = {
  padding: '24px',
  width: '100%',
  boxSizing: 'border-box',
  color: '#1e293b'
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '16px',
  flexWrap: 'wrap',
  marginBottom: '24px'
};

const addButtonStyle = {
  backgroundColor: '#2563eb',
  color: '#ffffff',
  border: 'none',
  padding: '10px 16px',
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: 600
};

const filterContainerStyle = {
  display: 'flex',
  gap: '12px',
  flexWrap: 'wrap',
  marginBottom: '20px'
};

const inputStyle = {
  padding: '10px 12px',
  border: '1px solid #cbd5e1',
  borderRadius: '8px',
  fontSize: '14px',
  minWidth: '220px',
  maxWidth: '100%',
  boxSizing: 'border-box',
  backgroundColor: '#ffffff',
  color: '#1e293b'
};

const tableWrapperStyle = {
  width: '100%',
  overflowX: 'auto',
  border: '1px solid #e2e8f0',
  borderRadius: '10px'
};

const tableStyle = {
  width: '100%',
  minWidth: '760px',
  borderCollapse: 'collapse',
  backgroundColor: '#ffffff'
};

const thStyle = {
  textAlign: 'left',
  padding: '14px 12px',
  backgroundColor: '#f1f5f9',
  color: '#334155',
  borderBottom: '1px solid #e2e8f0',
  whiteSpace: 'nowrap'
};

const tdStyle = {
  padding: '13px 12px',
  borderBottom: '1px solid #e2e8f0',
  fontSize: '14px',
  whiteSpace: 'nowrap'
};

const paginationStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '12px',
  marginTop: '18px'
};

const pageButtonStyle = {
  padding: '8px 12px',
  border: '1px solid #cbd5e1',
  borderRadius: '6px',
  backgroundColor: '#ffffff',
  cursor: 'pointer'
};

const modalOverlayStyle = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(15, 23, 42, 0.55)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '16px',
  zIndex: 1000,
  overflowY: 'auto'
};

const modalStyle = {
  backgroundColor: '#ffffff',
  padding: '24px',
  borderRadius: '12px',
  width: '100%',
  maxWidth: '480px',
  maxHeight: '90vh',
  overflowY: 'auto',
  boxSizing: 'border-box',
  boxShadow: '0 20px 25px rgba(0, 0, 0, 0.15)'
};

const labelStyle = {
  display: 'block',
  marginTop: '12px',
  marginBottom: '6px',
  fontWeight: 600,
  fontSize: '14px'
};

const formInputStyle = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid #cbd5e1',
  borderRadius: '8px',
  fontSize: '14px',
  boxSizing: 'border-box',
  backgroundColor: '#ffffff',
  color: '#1e293b'
};

const modalButtonsStyle = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '10px',
  marginTop: '24px',
  flexWrap: 'wrap'
};

const cancelButtonStyle = {
  backgroundColor: '#e2e8f0',
  color: '#1e293b',
  border: 'none',
  padding: '10px 16px',
  borderRadius: '8px',
  cursor: 'pointer'
};

export default EmployeeManagement;
