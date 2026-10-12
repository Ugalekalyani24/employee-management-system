import React, { useState, useEffect } from "react";
import EmployeeManagement from "./EmployeeManagement";
import AttendanceLeave from "./AttendanceLeave";
import Payroll from "./Payroll";
import JobVacancies from "./JobVacancies";
import JobApplications from "./JobApplications";
import Analytics from "./Analytics";

const Dashboard = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [employees, setEmployees] = useState([]);
  const [stats, setStats] = useState({
    totalEmployees: 10,
    openVacancies: 0,
    jobApplications: 0,
    pendingLeaves: 2,
  });

  // LocalStorage se logged-in user aur unka role nikalein
  const currentUser = JSON.parse(localStorage.getItem("user")) || {
    email: "user@company.com",
    role: "employee",
  };

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const empRes = await fetch("https://employee-management-system-1-6sdi.onrender.com/api/employees", { headers });
        if (empRes.ok) {
          const empData = await empRes.json();
          setEmployees(empData);
          setStats((prev) => ({ ...prev, totalEmployees: empData.length }));
        }
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
    };

    if (currentUser.role === "admin") {
      fetchDashboardStats();
    }
  }, [currentUser.role]);

  return (
    <div style={styles.container}>
      {/* Sidebar Navigation */}
      <aside style={styles.sidebar}>
        <div style={styles.brand}>
          <h2>EMS Portal</h2>
          <span style={styles.roleBadge}>
            {currentUser.role === "admin" ? "👑 Admin Access" : "👤 Employee Access"}
          </span>
        </div>

        <nav style={styles.nav}>
          <button
            style={activeTab === "overview" ? styles.activeNavBtn : styles.navBtn}
            onClick={() => setActiveTab("overview")}
          >
            📊 Overview
          </button>

          {/* COMMON FOR BOTH ADMIN & EMPLOYEE */}
          <button
            style={activeTab === "attendance" ? styles.activeNavBtn : styles.navBtn}
            onClick={() => setActiveTab("attendance")}
          >
            📅 Attendance & Leave
          </button>

          <button
            style={activeTab === "payroll" ? styles.activeNavBtn : styles.navBtn}
            onClick={() => setActiveTab("payroll")}
          >
            💳 {currentUser.role === "admin" ? "Manage Payroll" : "My Payslips"}
          </button>

          {/* SIRF ADMIN KO DIKHEGA (RBAC RESTRICTION) */}
          {currentUser.role === "admin" && (
            <>
              <button
                style={activeTab === "employees" ? styles.activeNavBtn : styles.navBtn}
                onClick={() => setActiveTab("employees")}
              >
                👥 Manage Employees
              </button>
              <button
                style={activeTab === "vacancies" ? styles.activeNavBtn : styles.navBtn}
                onClick={() => setActiveTab("vacancies")}
              >
                💼 Job Vacancies
              </button>
              <button
                style={activeTab === "applications" ? styles.activeNavBtn : styles.navBtn}
                onClick={() => setActiveTab("applications")}
              >
                📋 Applications
              </button>
              <button
                style={activeTab === "analytics" ? styles.activeNavBtn : styles.navBtn}
                onClick={() => setActiveTab("analytics")}
              >
                📈 Analytics
              </button>
            </>
          )}
        </nav>

        <button onClick={onLogout} style={styles.logoutBtn}>
          🚪 Logout
        </button>
      </aside>

      {/* Main Content Area */}
      <main style={styles.content}>
        {activeTab === "overview" && (
          <div>
            <h1 style={styles.headerTitle}>Welcome, {currentUser.name || currentUser.email}</h1>
            <p style={styles.subtitle}>
              Role: <strong>{currentUser.role.toUpperCase()}</strong>
            </p>

            {/* ADMIN OVERVIEW METRICS */}
            {currentUser.role === "admin" ? (
              <>
                <div style={styles.statsGrid}>
                  <div style={styles.card}>
                    <span style={styles.cardIcon}>👥</span>
                    <div>
                      <span style={styles.cardLabel}>Total Employees</span>
                      <h2 style={styles.cardValue}>{stats.totalEmployees}</h2>
                    </div>
                  </div>
                  <div style={styles.card}>
                    <span style={styles.cardIcon}>💼</span>
                    <div>
                      <span style={styles.cardLabel}>Open Vacancies</span>
                      <h2 style={{ ...styles.cardValue, color: "#2563eb" }}>{stats.openVacancies}</h2>
                    </div>
                  </div>
                  <div style={styles.card}>
                    <span style={styles.cardIcon}>📋</span>
                    <div>
                      <span style={styles.cardLabel}>Job Applications</span>
                      <h2 style={{ ...styles.cardValue, color: "#16a34a" }}>{stats.jobApplications}</h2>
                    </div>
                  </div>
                </div>

                <div style={styles.quickActions}>
                  <h3>Admin Actions</h3>
                  <div style={styles.actionButtons}>
                    <button style={styles.primaryBtn} onClick={() => setActiveTab("employees")}>
                      + Add New Employee
                    </button>
                    <button style={styles.successBtn} onClick={() => setActiveTab("vacancies")}>
                      + Post Job Vacancy
                    </button>
                    <button style={styles.purpleBtn} onClick={() => setActiveTab("payroll")}>
                      📊 Process Monthly Payroll
                    </button>
                  </div>
                </div>
              </>
            ) : (
              /* EMPLOYEE OVERVIEW METRICS */
              <div style={styles.quickActions}>
                <h3>Employee Quick Portal</h3>
                <p>Welcome to your personal dashboard. Select an option below to manage your tasks:</p>
                <div style={styles.actionButtons}>
                  <button style={styles.primaryBtn} onClick={() => setActiveTab("attendance")}>
                    📅 Punch Attendance & Apply Leave
                  </button>
                  <button style={styles.successBtn} onClick={() => setActiveTab("payroll")}>
                    📄 View & Download Pay Slips
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Dynamic Navigation Views */}
        {activeTab === "attendance" && <AttendanceLeave />}
        {activeTab === "payroll" && <Payroll />}

        {/* Restricted Admin Views */}
        {currentUser.role === "admin" && (
          <>
            {activeTab === "employees" && <EmployeeManagement />}
            {activeTab === "vacancies" && <JobVacancies />}
            {activeTab === "applications" && <JobApplications />}
           {activeTab === "analytics" && (
  <Analytics employees={employees} />
)}
          </>
        )}
      </main>
    </div>
  );
};

const styles = {
  container: { display: "flex", minHeight: "100vh", backgroundColor: "#f8fafc", fontFamily: "Inter, sans-serif" },
  sidebar: { width: "260px", backgroundColor: "#0f172a", color: "#fff", padding: "24px 16px", display: "flex", flexDirection: "column" },
  brand: { marginBottom: "24px", paddingLeft: "12px", borderBottom: "1px solid #334155", paddingBottom: "16px" },
  roleBadge: { fontSize: "12px", backgroundColor: "#334155", padding: "4px 8px", borderRadius: "4px", color: "#38bdf8", marginTop: "6px", display: "inline-block" },
  nav: { display: "flex", flexDirection: "column", gap: "8px", flex: 1 },
  navBtn: { padding: "12px 16px", backgroundColor: "transparent", color: "#94a3b8", border: "none", borderRadius: "8px", textAlign: "left", cursor: "pointer", fontSize: "14px", fontWeight: "500" },
  activeNavBtn: { padding: "12px 16px", backgroundColor: "#2563eb", color: "#ffffff", border: "none", borderRadius: "8px", textAlign: "left", cursor: "pointer", fontSize: "14px", fontWeight: "600" },
  logoutBtn: { padding: "12px 16px", backgroundColor: "#dc2626", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600", marginTop: "auto" },
  content: { flex: 1, padding: "32px", overflowY: "auto" },
  headerTitle: { fontSize: "28px", fontWeight: "700", color: "#0f172a", margin: 0 },
  subtitle: { color: "#64748b", margin: "4px 0 24px" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px", marginBottom: "32px" },
  card: { backgroundColor: "#fff", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "16px" },
  cardIcon: { fontSize: "32px" },
  cardLabel: { fontSize: "13px", color: "#64748b", fontWeight: "500" },
  cardValue: { fontSize: "24px", fontWeight: "700", color: "#0f172a", margin: "4px 0 0" },
  quickActions: { backgroundColor: "#fff", padding: "24px", borderRadius: "12px", border: "1px solid #e2e8f0" },
  actionButtons: { display: "flex", gap: "12px", marginTop: "16px", flexWrap: "wrap" },
  primaryBtn: { padding: "10px 18px", backgroundColor: "#2563eb", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600" },
  successBtn: { padding: "10px 18px", backgroundColor: "#059669", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600" },
  purpleBtn: { padding: "10px 18px", backgroundColor: "#7c3aed", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600" },
};

export default Dashboard;