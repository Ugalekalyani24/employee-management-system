import React from "react";

export default function Analytics({ employees = [] }) {
  // जर प्रोप्समधून डेटा आला नाही, तर आपण ही सॅम्पल लिस्ट वापरू जेणेकरून डॅशबोर्ड रिकामा दिसणार नाही
  const defaultEmployees = [
    { id: 1, name: 'Shubham Kokane', department: 'IT', salary: 75000 },
    { id: 2, name: 'Neha Kadam', department: 'HR', salary: 50000 },
    { id: 3, name: 'Pranali Shelar', department: 'IT', salary: 48000 },
    { id: 4, name: 'Sakshi Chavan', department: 'Finance', salary: 45000 },
    { id: 5, name: 'Siddhi Ugale', department: 'IT', salary: 52000 },
    { id: 6, name: 'Kritika Salunkhe', department: 'Sales', salary: 42000 },
    { id: 7, name: 'Bhakti Jagdale', department: 'HR', salary: 40000 },
    { id: 8, name: 'Aditya Verma', department: 'IT', salary: 46000 },
    { id: 9, name: 'Priya Sharma', department: 'Finance', salary: 49000 },
    { id: 10, name: 'Rohan Patil', department: 'Sales', salary: 58000 },
    { id: 11, name: 'Ananya Deshmukh', department: 'IT', salary: 44000 }
  ];

  const employeeList = employees.length > 0 ? employees : defaultEmployees;

  const totalEmployees = employeeList.length;

  const totalPayroll = employeeList.reduce((total, emp) => {
    return total + (Number(emp.salary) || 0);
  }, 0);

  const departmentsCount = new Set(
    employeeList
      .map((emp) => emp.department)
      .filter(Boolean)
  ).size;

  const cardStyle = {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    padding: "24px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  };

  const cards = [
    { label: "Total Employees", value: totalEmployees },
    { label: "Active Departments", value: departmentsCount },
    {
      label: "Total Payroll",
      value: `₹${totalPayroll.toLocaleString("en-IN")}`,
    },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <h2 style={{ color: "#0f172a", marginBottom: "20px" }}>
        Analytics Dashboard
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
        }}
      >
        {cards.map((card) => (
          <div key={card.label} style={cardStyle}>
            <p style={{ color: "#64748b", margin: "0 0 12px" }}>
              {card.label}
            </p>
            <h2 style={{ color: "#0f172a", margin: 0 }}>
              {card.value}
            </h2>
          </div>
        ))}
      </div>
    </div>
  );
}