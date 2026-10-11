
import React from "react";

export default function Analytics({ employees = [] }) {
  const totalEmployees = employees.length;

  const totalPayroll = employees.reduce((total, emp) => {
    return total + (Number(emp.salary) || 0);
  }, 0);

  const departmentsCount = new Set(
    employees
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
