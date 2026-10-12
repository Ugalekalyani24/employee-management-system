import React, { useState, useEffect, useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { LayoutDashboard, User, Clock, FileText, CreditCard, LogOut } from "lucide-react";

function EmployeePortal({ onLogout }) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const payslipRef = useRef(null);

  // 1. Employee Profile State
  
const savedUser = JSON.parse(localStorage.getItem("user")) || {};

const [payroll, setPayroll] = useState(null);

useEffect(() => {
  const fetchPayroll = async () => {
    try {
      const response = await fetch("https://employee-management-system-1-6sdi.onrender.com/api/payroll");

      if (!response.ok) {
        throw new Error("Payroll data fetch failed");
      }

      const data = await response.json();

      const employeeName = (
        savedUser.name || "Shubham Kokane"
      ).trim().toLowerCase();

      const employeePayroll = data.find(
        (item) =>
          (item.employeeName || "").trim().toLowerCase() === employeeName
      );

      setPayroll(employeePayroll || null);
    } catch (error) {
      console.error("Payroll fetch error:", error);
    }
  };

  fetchPayroll();
}, []);


const [profile, setProfile] = useState({
  name: savedUser.name || "Shubham",
  fullName: savedUser.name || "Shubham Kokane",
  email: savedUser.email || "shubham.k@company.com",
  empId: "1001",
  designation: savedUser.designation || "Full Stack Developer",
  department: savedUser.department || "IT",
  phone: savedUser.phone || "+91 98765 43210",
  address: savedUser.address || "Kalyan, Maharashtra",
  joiningDate: savedUser.joiningDate || "15 Jan 2024",
  emergencyContact: savedUser.emergencyContact || "+91 98123 45678",
});

  // Admin-Employee integration: Auto-sync backend data every 5 seconds
  useEffect(() => {
    const fetchLatestProfile = async () => {
      try {
        const token = localStorage.getItem("token"); // agar token use kar rahe ho
        const res = await axios.get("https://employee-management-system-1-6sdi.onrender.com/api/employee/me", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data) {
          setProfile(prev => ({ ...prev, ...res.data }));
        }
      } catch (err) {
        console.error("Auto-sync error:", err);
      }
    };

    fetchLatestProfile();
    const interval = setInterval(fetchLatestProfile, 5000);
    return () => clearInterval(interval);
  }, []);

  // Profile Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editPhone, setEditPhone] = useState(profile.phone);
  const [editAddress, setEditAddress] = useState(profile.address);

  // 2. Attendance & Live Clock State
  const [isPunchedIn, setIsPunchedIn] = useState(false);
  const [punchStatus, setPunchStatus] = useState("Not Punched In");
  const [punchTime, setPunchTime] = useState("");
  const [secondsWorked, setSecondsWorked] = useState(0);

  // Overtime (OT) Tracking State
  const [otHours, setOtHours] = useState(10);
  const otRatePerHour = 500;
  const otPayTotal = otHours * otRatePerHour; // ₹5,000


  // Live Timer Effect
  useEffect(() => {
    let timer;
    if (isPunchedIn) {
      timer = setInterval(() => {
        setSecondsWorked((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPunchedIn]);

  const formatTimer = (totalSeconds) => {
    const hrs = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
    const mins = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
    const secs = String(totalSeconds % 60).padStart(2, "0");
    return `${hrs}:${mins}:${secs}`;
  };

  // API Attendance Punch
  const handlePunch = async (type) => {
    try {
      const response = await fetch("https://employee-management-system-1-6sdi.onrender.com/api/attendance/punch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: savedUser.id || 1001, type }),
      });

      const data = await response.json();
      if (response.ok) {
        if (type === "in") {
          setIsPunchedIn(true);
          setPunchStatus("Punched In");
          setPunchTime(data.punchIn || new Date().toLocaleTimeString());
        } else {
          setIsPunchedIn(false);
          setPunchStatus("Punched Out");
          setPunchTime(data.punchOut || new Date().toLocaleTimeString());
        }
        alert(data.message || `Punch ${type.toUpperCase()} successful!`);
      } else {
        alert(data.error || "Failed to mark attendance");
      }
    } catch (err) {
      if (type === "in") {
        setIsPunchedIn(true);
        setPunchStatus("Punched In");
        setPunchTime(new Date().toLocaleTimeString());
      } else {
        setIsPunchedIn(false);
        setPunchStatus("Punched Out");
      }
    }
  };

  // 3. Leave Management State
  const [leaveBalances] = useState({ casual: 12, sick: 8 });
  const [leaveType, setLeaveType] = useState("Casual Leave");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [leaveReason, setLeaveReason] = useState("");
  const [leaveMessage, setLeaveMessage] = useState("");
  const [leaveHistory, setLeaveHistory] = useState([
    { id: 1, type: "Casual Leave", start: "2026-09-10", end: "2026-09-11", status: "Approved", reason: "Personal work" },
    { id: 2, type: "Sick Leave", start: "2026-08-01", end: "2026-08-02", status: "Rejected", reason: "Fever" },
  ]);

  const fetchLeaves = async () => {
    try {
      const res = await fetch("https://employee-management-system-1-6sdi.onrender.com/api/leaves");
      if (res.ok) {
        const data = await res.json();
        const userLeaves = data.filter(
          (item) => item.userId === savedUser.id || item.userEmail === profile.email
        );
        if (userLeaves.length > 0) {
          setLeaveHistory(userLeaves);
        }
      }
    } catch (err) {
      console.error("Error fetching leaves:", err);
    }
  };

  useEffect(() => {
    if (activeTab === "leaves" || activeTab === "attendance") {
      fetchLeaves();
    }
  }, [activeTab]);

  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    setLeaveMessage("");

    try {
      const response = await fetch("https://employee-management-system-1-6sdi.onrender.com/api/leaves/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: savedUser.id || 1001,
          userEmail: profile.email,
          leaveType,
          startDate,
          endDate,
          reason: leaveReason,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setLeaveMessage("✅ Leave request submitted successfully!");
        const newReq = {
          id: Date.now(),
          type: leaveType,
          start: startDate,
          end: endDate,
          status: "Pending",
          reason: leaveReason,
        };
        setLeaveHistory([newReq, ...leaveHistory]);
        setLeaveReason("");
        setStartDate("");
        setEndDate("");
      } else {
        setLeaveMessage("❌ Failed to submit leave request.");
      }
    } catch (err) {
      const newReq = {
        id: Date.now(),
        type: leaveType,
        start: startDate,
        end: endDate,
        status: "Pending",
        reason: leaveReason,
      };
      setLeaveHistory([newReq, ...leaveHistory]);
      setLeaveMessage("✅ Leave application recorded locally!");
      setLeaveReason("");
      setStartDate("");
      setEndDate("");
    }
  };

  const handleProfileSave = (e) => {
    e.preventDefault();
    setProfile({ ...profile, phone: editPhone, address: editAddress });
    setIsEditing(false);
    alert("Profile updated successfully!");
  };

  // Direct PDF Download Logic
  const handleDownloadPDF = async () => {
    const element = payslipRef.current;
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 10, imgWidth, imgHeight);
      pdf.save(`Payslip_October_2026_${profile.empId}.pdf`);
    } catch (error) {
      console.error("PDF Download error:", error);
      alert("Failed to download PDF!");
    }
  };

  return (
    <div style={styles.container}>
      {/* Sidebar Navigation */}
      <aside style={styles.sidebar}>
        <div>
          <div style={styles.brand}>
            <h2 style={{ margin: 0, fontSize: "20px", color: "#ffffff", fontWeight: "bold" }}>EMS Portal</h2>
          </div>

          <nav style={styles.nav}>
            <button
              style={activeTab === "dashboard" ? styles.activeNavBtn : styles.navBtn}
              onClick={() => setActiveTab("dashboard")}
            >
              <LayoutDashboard size={18} style={{ marginRight: "10px" }} /> Dashboard
            </button>
            <button
              style={activeTab === "profile" ? styles.activeNavBtn : styles.navBtn}
              onClick={() => setActiveTab("profile")}
            >
              <User size={18} style={{ marginRight: "10px" }} /> My Profile
            </button>
            <button
              style={activeTab === "attendance" ? styles.activeNavBtn : styles.navBtn}
              onClick={() => setActiveTab("attendance")}
            >
              <Clock size={18} style={{ marginRight: "10px" }} /> Attendance & Clock
            </button>
            <button
              style={activeTab === "leaves" ? styles.activeNavBtn : styles.navBtn}
              onClick={() => setActiveTab("leaves")}
            >
              <FileText size={18} style={{ marginRight: "10px" }} /> Leave Management
            </button>
            <button
              style={activeTab === "salary" ? styles.activeNavBtn : styles.navBtn}
              onClick={() => setActiveTab("salary")}
            >
              <CreditCard size={18} style={{ marginRight: "10px" }} /> Salary & Payslips
            </button>
          </nav>
        </div>

        <button onClick={onLogout} style={styles.logoutBtn}>
          <LogOut size={18} style={{ marginRight: "10px" }} /> Logout
        </button>
      </aside>
      {/* Main View Area */}
      <main style={styles.content}>

        {/* MODULE 1: DASHBOARD OVERVIEW */}
        {activeTab === "dashboard" && (
          <div style={styles.dashboardWrapper}>
            <div style={styles.headerRow}>
              <div>
                <h1 style={styles.greetingTitle}>Good morning, {profile.name}! 👋</h1>
                <p style={styles.greetingSub}>Here is your employee overview.</p>
              </div>
              <div style={{ position: "relative", display: "inline-block" }}>
                <div style={styles.avatarCircle}>SK</div>
                <span style={styles.onlineDot}></span>
              </div>
            </div>

            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <div style={styles.statHeader}>
                  <Clock size={16} color="#64748b" />
                  <span style={styles.statLabel}>Attendance</span>
                </div>
                <h2 style={styles.statValue}>22 days</h2>
                <span style={{ fontSize: "12px", color: "#10b981", fontWeight: "600" }}>This month</span>
              </div>

              <div style={styles.statCard}>
                <div style={styles.statHeader}>
                  <FileText size={16} color="#64748b" />
                  <span style={styles.statLabel}>Leave balance</span>
                </div>
                <h2 style={styles.statValue}>{leaveBalances.sick} days</h2>
                <span style={{ fontSize: "12px", color :"#64748b" }}>Available</span>
              </div>

              <div style={styles.statCard}>
                <div style={styles.statHeader}>
                  <Clock size={16} color="#64748b" />
                  <span style={styles.statLabel}>Today's hours</span>
                </div>
                <h2 style={{ ...styles.statValue, fontFamily: "monospace" }}>
                  {formatTimer(secondsWorked).slice(0, 5)}
                </h2>
                <span style={{ fontSize: "12px", color: isPunchedIn ? "#10b981" : "#64748b", fontWeight: "600" }}>
                  {isPunchedIn ? "Checked in" : "Not checked in"}
                </span>
              </div>

              <div style={styles.statCard}>
                <div style={styles.statHeader}>
                  <CreditCard size={16} color="#64748b" />
                  <span style={styles.statLabel}>Latest payslip</span>
                </div>
                <h2 style={styles.statValue}>October</h2>
                <span
                  style={{ fontSize: "12px", color: "#2563eb", cursor: "pointer", fontWeight: "600" }}
                  onClick={() => setActiveTab("salary")}
                >
                  View salary details (₹85,000)
                </span>
              </div>
            </div>

            <div style={styles.sectionCard}>
              <h3 style={styles.sectionTitle}>Quick actions</h3>
              <div style={styles.actionButtonsRow}>
                <button
                  style={isPunchedIn ? styles.dangerActionBtn : styles.primaryActionBtn}
                  onClick={() => handlePunch(isPunchedIn ? "out" : "in")}
                >
                  {isPunchedIn ? "Check Out" : "Check In"}
                </button>
                <button style={styles.secondaryActionBtn} onClick={() => setActiveTab("leaves")}>
                  Apply Leave
                </button>
                <button style={styles.secondaryActionBtn} onClick={() => setActiveTab("salary")}>
                  Payslips
                </button>
              </div>
            </div>

            <div style={styles.sectionCard}>
              <h3 style={styles.sectionTitle}>Upcoming events</h3>
              <div style={styles.eventsList}>
                <div style={styles.eventItem}>
                  <div style={styles.eventIcon}>📅</div>
                  <div>
                    <h4 style={styles.eventTitle}>Team meeting</h4>
                    <p style={styles.eventSub}>10:30 AM · IT Department</p>
                  </div>
                </div>

                <div style={styles.eventItem}>
                  <div style={styles.eventIcon}>🎂</div>
                  <div>
                    <h4 style={styles.eventTitle}>Team birthday</h4>
                    <p style={styles.eventSub}>Upcoming celebration</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODULE 2: MY PROFILE */}
        {activeTab === "profile" && (
          <div style={styles.dashboardWrapper}>
            <h1 style={styles.greetingTitle}>My Profile</h1>
            <p style={styles.greetingSub}>Personal and employment details</p>

            <div style={styles.sectionCard}>
              <div style={styles.profileHeader}>
                <div style={styles.avatar}>SK</div>
                <div>
                  <h2 style={{ margin: 0, fontSize: "22px", color: "#0f172a" }}>{profile.fullName}</h2>
                  <p style={{ margin: "4px 0 0 0", color: "#2563eb", fontWeight: "600" }}>
                    {profile.designation} — {profile.department}
                  </p>
                </div>
              </div>

              <hr style={styles.hr} />

              {!isEditing ? (
                <div>
                  <div style={styles.detailsGrid}>
                    <div>
                      <span style={styles.detailLabel}>Employee ID</span>
                      <p style={styles.detailValue}>{profile.empId}</p>
                    </div>
                    <div>
                      <span style={styles.detailLabel}>Email Address</span>
                      <p style={styles.detailValue}>{profile.email}</p>
                    </div>
                    <div>
                      <span style={styles.detailLabel}>Phone Number</span>
                      <p style={styles.detailValue}>{profile.phone}</p>
                    </div>
                    <div>
                      <span style={styles.detailLabel}>Address</span>
                      <p style={styles.detailValue}>{profile.address}</p>
                    </div>
                    <div>
                      <span style={styles.detailLabel}>Joining Date</span>
                      <p style={styles.detailValue}>{profile.joiningDate}</p>
                    </div>
                    <div>
                      <span style={styles.detailLabel}>Emergency Contact</span>
                      <p style={{ ...styles.detailValue, color: "#dc2626" }}>{profile.emergencyContact}</p>
                    </div>
                  </div>
                  <button style={{ ...styles.primaryActionBtn, marginTop: "20px" }} onClick={() => setIsEditing(true)}>
                    Edit Phone & Address
                  </button>
                </div>
              ) : (
                <form onSubmit={handleProfileSave} style={{ display: "flex", flexDirection: "column", gap: "12px", maxWidth: "400px" }}>
                  <label style={{ fontSize: "14px", fontWeight: "600", color: "#475569" }}>
                    Phone Number:
                    <input style={styles.cleanInput} type="text" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} required />
                  </label>
                  <label style={{ fontSize: "14px", fontWeight: "600", color: "#475569" }}>
                    Address:
                    <input style={styles.cleanInput} type="text" value={editAddress} onChange={(e) => setEditAddress(e.target.value)} required />
                  </label>
                  <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                    <button type="submit" style={styles.successActionBtn}>Save Changes</button>
                    <button type="button" style={styles.secondaryActionBtn} onClick={() => setIsEditing(false)}>Cancel</button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* MODULE 3: ATTENDANCE & LIVE CLOCK */}
        {activeTab === "attendance" && (
          <div style={styles.dashboardWrapper}>
            <h1 style={styles.greetingTitle}>Attendance & Live Clock</h1>
            <p style={styles.greetingSub}>Employee: <strong>{profile.fullName}</strong> (ID: {profile.empId})</p>

            <div style={styles.statsGrid}>
              <div style={styles.sectionCard}>
                <h3 style={{ marginTop: 0 }}>Daily Check-In / Check-Out</h3>
                <p>Status: <strong style={{ color: isPunchedIn ? "#10b981" : "#ef4444" }}>{punchStatus}</strong></p>
                {punchTime && <p style={{ fontSize: "14px", color: "#64748b" }}>Last Punch: {punchTime}</p>}

                <div style={styles.lightBoxDisplay}>
                  <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>Live Working-Hours Counter</p>
                  <h2 style={{ margin: "5px 0", fontSize: "32px", fontFamily: "monospace", color: "#0f172a" }}>{formatTimer(secondsWorked)}</h2>
                </div>

                <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
                  <button style={styles.successActionBtn} onClick={() => handlePunch("in")}>
                    Punch IN
                  </button>
                  <button style={styles.dangerActionBtn} onClick={() => handlePunch("out")}>
                    Punch OUT
                  </button>
                </div>
              </div>

              <div style={styles.sectionCard}>
                <h3 style={{ marginTop: 0 }}>Attendance & Overtime Summary</h3>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "16px" }}>
                  <div>
                    <span style={styles.detailLabel}>Present Days</span>
                    <h2 style={{ margin: "4px 0", color: "#10b981" }}>22</h2>
                  </div>
                  <div>
                    <span style={styles.detailLabel}>Late Arrivals</span>
                    <h2 style={{ margin: "4px 0", color: "#d97706" }}>2</h2>
                  </div>
                  <div>
                    <span style={styles.detailLabel}>Overtime (OT)</span>
                    <h2 style={{ margin: "4px 0", color: "#2563eb" }}>{otHours} hrs</h2>
                  </div>
                </div>

                <div style={styles.otBox}>
                  <span style={{ fontSize: "11px", color: "#1e40af", fontWeight: "bold" }}>⚡ OT PAYABLE BONUS</span>
                  <p style={{ margin: "2px 0 0 0", fontSize: "14px", color: "#1e3a8a", fontWeight: "bold" }}>
                    10 Hours Logged × ₹500/hr = +₹{otPayTotal.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODULE 4: LEAVE MANAGEMENT */}
        {activeTab === "leaves" && (
          <div style={styles.dashboardWrapper}>
            <h1 style={styles.greetingTitle}>Leave Management</h1>
            <p style={styles.greetingSub}>Apply for leave and view request history</p>

            <div style={{ display: "flex", gap: "16px", marginBottom: "10px" }}>
              <div style={{ ...styles.statCard, flex: 1 }}>
                <span style={styles.detailLabel}>Casual Leave Balance</span>
                <h2 style={{ margin: "5px 0", color: "#2563eb" }}>12 Days Left</h2>
              </div>
              <div style={{ ...styles.statCard, flex: 1 }}>
                <span style={styles.detailLabel}>Sick Leave Balance</span>
                <h2 style={{ margin: "5px 0", color: "#10b981" }}>8 Days Left</h2>
              </div>
            </div>

            <div style={styles.statsGrid}>
              <div style={styles.sectionCard}>
                <h3 style={{ marginTop: 0 }}>Apply for Leave</h3>
                {leaveMessage && (
                  <p style={{ color: leaveMessage.includes("✅") ? "green" : "red", fontSize: "14px" }}>
                    {leaveMessage}
                  </p>
                )}
                <form onSubmit={handleLeaveSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <label style={{ fontSize: "14px", color: "#475569" }}>
                    Leave Type:
                    <select style={styles.cleanInput} value={leaveType} onChange={(e) => setLeaveType(e.target.value)}>
                      <option value="Casual Leave">Casual Leave</option>
                      <option value="Sick Leave">Sick Leave</option>
                      <option value="Medical Leave">Medical Leave</option>
                    </select>
                  </label>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <label style={{ flex: 1, fontSize: "14px", color: "#475569" }}>
                      Start Date:
                      <input style={styles.cleanInput} type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
                    </label>
                    <label style={{ flex: 1, fontSize: "14px", color: "#475569" }}>
                      End Date:
                      <input style={styles.cleanInput} type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
                    </label>
                  </div>
                  <label style={{ fontSize: "14px", color: "#475569" }}>
                    Reason:
                    <textarea style={styles.cleanInput} rows="3" value={leaveReason} onChange={(e) => setLeaveReason(e.target.value)} required />
                  </label>
                  <button type="submit" style={styles.primaryActionBtn}>Submit Application</button>
                </form>
              </div>

              <div style={styles.sectionCard}>
                <h3 style={{ marginTop: 0 }}>Request History</h3>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Type</th>
                      <th style={styles.th}>Dates</th>
                      <th style={styles.th}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaveHistory.map((item) => (
                      <tr key={item.id}>
                        <td style={styles.td}>{item.type || item.leaveType}</td>
                        <td style={styles.td}>{item.start ? `${item.start} to ${item.end}` : item.createdAt || "Today"}</td>
                        <td style={styles.td}>
                          <span style={{ fontWeight: "bold", color: item.status === "Approved" ? "#10b981" : item.status === "Rejected" ? "#ef4444" : "#d97706" }}>
                            {item.status || "Pending"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        {/* MODULE 5: SALARY & PAYSLIPS */}
        {activeTab === "salary" && (
          <div style={styles.dashboardWrapper}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h1 style={styles.greetingTitle}>Salary & Payslips</h1>
                <p style={styles.greetingSub}>Official Monthly Salary Statement</p>
              </div>
              <button style={styles.successActionBtn} onClick={handleDownloadPDF}>
                Download PDF Payslip
              </button>
            </div>

            <div ref={payslipRef} style={styles.payslipPaper}>
              <div style={styles.payslipHeader}>
                <div>
                  <h2 style={{ margin: 0, color: "#0f172a", fontSize: "20px", fontWeight: "bold" }}>
                    TECH CORP SOLUTIONS PVT LTD
                  </h2>
                  <p style={{ margin: "3px 0 0 0", color: "#64748b", fontSize: "12px" }}>
                    IT Park, Powai, Mumbai - 400076, India
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={styles.badgeLabel}>PAYSLIP RECEIPT</span>
                  <p style={{ margin: "4px 0 0 0", color: "#0f172a", fontSize: "13px", fontWeight: "bold" }}>
                    FOR OCTOBER 2026
                  </p>
                </div>
              </div>

              <hr style={{ border: "none", borderTop: "2px solid #e2e8f0", margin: "16px 0" }} />

              <div style={styles.empInfoGrid}>
                <div>
                  <p style={{ margin: "4px 0", fontSize: "13px" }}><strong>Employee Name:</strong> {profile.fullName}</p>
                  <p style={{ margin: "4px 0", fontSize: "13px" }}><strong>Employee ID:</strong> {profile.empId}</p>
                  <p style={{ margin: "4px 0", fontSize: "13px" }}><strong>Designation:</strong> {profile.designation}</p>
                </div>
                <div>
                  <p style={{ margin: "4px 0", fontSize: "13px" }}><strong>Department:</strong> {profile.department}</p>
                  <p style={{ margin: "4px 0", fontSize: "13px" }}><strong>Bank Account:</strong> XXXXXX4589</p>
                  <p style={{ margin: "4px 0", fontSize: "13px" }}><strong>PF Account No:</strong> MH/MUM/10293/001</p>
                </div>
              </div>

              <table style={styles.table}>
                <thead>
                  <tr style={{ backgroundColor: "#f8fafc" }}>
                    <th style={styles.th}>EARNINGS</th>
                    <th style={styles.th}>AMOUNT (₹)</th>
                    <th style={styles.th}>DEDUCTIONS</th>
                    <th style={styles.th}>AMOUNT (₹)</th>
                  </tr>
                </thead>
                <tbody>
                 <tr>
  <td style={styles.td}>Basic Salary</td>
  <td style={styles.td}>₹75,000</td>
  <td style={styles.td}>Provident Fund (PF)</td>
  <td style={styles.td}>₹3,000</td>
</tr>
                  <tr>
                    <td style={styles.td}>House Rent Allowance (HRA)</td>
                    <td style={styles.td}>₹18,000</td>
                    <td style={styles.td}>Professional Tax</td>
                    <td style={styles.td}>₹200</td>
                  </tr>
                  <tr>
                    <td style={styles.td}>Special Allowance</td>
                    <td style={styles.td}>₹12,000</td>
                    <td style={styles.td}>TDS / Income Tax</td>
                    <td style={styles.td}>₹2,000</td>
                  </tr>
                  <tr style={{ backgroundColor: "#eff6ff" }}>
                    <td style={{ ...styles.td, color: "#1d4ed8", fontWeight: "bold" }}>
                      Overtime (OT) Pay ({otHours} hrs @ ₹500/hr)
                    </td>
                    <td style={{ ...styles.td, color: "#1d4ed8", fontWeight: "bold" }}>
                      ₹{otPayTotal.toLocaleString("en-IN")}
                    </td>
                    <td style={styles.td}>-</td>
                    <td style={styles.td}>-</td>
                  </tr>
                  <tr style={{ fontWeight: "bold", backgroundColor: "#f1f5f9" }}>
                    <td style={styles.td}>Total Gross Earnings (A)</td>
                    <td style={styles.td}>₹1,10,000</td>
                    <td style={styles.td}>Total Deductions (B)</td>
                    <td style={styles.td}>₹5,200</td>
                  </tr>
                </tbody>
              </table>

              
<div style={styles.netPayBox}>
  <div>
    <span
      style={{
        fontSize: "11px",
        color: "#64748b",
        textTransform: "uppercase",
        fontWeight: "bold",
      }}
    >
      Net Salary Payable (A - B)
    </span>

    <h2
      style={{
        margin: "2px 0 0 0",
        color: "#10b981",
        fontSize: "24px",
      }}
    >
      ₹{Number(payroll?.netPay || 0).toLocaleString("en-IN")}
    </h2>

    <p
      style={{
        margin: "2px 0 0 0",
        fontSize: "11px",
        color: "#64748b",
      }}
    >
      Month: {payroll?.month || "No payroll generated"}
    </p>

    <p
      style={{
        margin: "2px 0 0 0",
        fontSize: "11px",
        color: "#64748b",
      }}
    >
      Status: {payroll?.status || "Not available"}
    </p>
  </div>
</div>

              <div style={{ marginTop: "24px", display: "flex", justifyContent: "space-between", alignItems: "flex-end", fontSize: "11px", color: "#94a3b8" }}>
                <p style={{ margin: 0 }}>This is an official system generated payslip.</p>
                <div style={{ textAlign: "center", borderTop: "1px solid #cbd5e1", paddingTop: "4px", width: "140px" }}>
                  HR Manager
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
    backgroundColor: "#f8fafc",
    color: "#0f172a",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  sidebar: {
    width: "230px",
    backgroundColor: "#0f172a",
    borderRight: "1px solid #1e293b",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    justify: "space-between",
  },
  brand: {
    paddingBottom: "15px",
    borderBottom: "1px solid #334155",
    marginBottom: "20px",
  },
  nav: { display: "flex", flexDirection: "column", gap: "8px" },
  navBtn: {
    padding: "10px 12px",
    backgroundColor: "transparent",
    color: "#94a3b8",
    border: "none",
    textAlign: "left",
    cursor: "pointer",
    borderRadius: "8px",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
  },
  activeNavBtn: {
    padding: "10px 12px",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    border: "none",
    textAlign: "left",
    cursor: "pointer",
    borderRadius: "8px",
    fontWeight: "bold",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
  },
  logoutBtn: {
    padding: "10px",
    backgroundColor: "transparent",
    color: "#ef4444",
    border: "none",
    textAlign: "left",
    cursor: "pointer",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
  },
  content: { flex: 1, padding: "30px", overflowY: "auto" },
  dashboardWrapper: {
    maxWidth: "850px",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greetingTitle: { fontSize: "26px", margin: 0, fontWeight: "700", color: "#0f172a" },
  greetingSub: { margin: "4px 0 0 0", color: "#64748b", fontSize: "14px" },
  avatarCircle: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    fontSize: "14px",
  },
  onlineDot: {
    position: "absolute",
    bottom: "0px",
    right: "0px",
    width: "10px",
    height: "10px",
    backgroundColor: "#10b981",
    borderRadius: "50%",
    border: "2px solid #ffffff",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "16px",
  },
  statCard: {
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    padding: "18px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  },
  statHeader: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "10px",
  },
  statLabel: { fontSize: "13px", color: "#64748b" },
  statValue: {
    fontSize: "24px",
    margin: "4px 0",
    fontWeight: "700",
    color: "#0f172a",
  },
  sectionCard: {
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    padding: "20px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  },
  sectionTitle: { fontSize: "16px", margin: "0 0 16px 0", fontWeight: "600", color: "#0f172a" },
  actionButtonsRow: { display: "flex", gap: "12px" },
  primaryActionBtn: {
    padding: "10px 20px",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    fontWeight: "600",
    cursor: "pointer",
  },
  secondaryActionBtn: {
    padding: "10px 20px",
    backgroundColor: "#f1f5f9",
    color: "#0f172a",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    fontWeight: "600",
    cursor: "pointer",
  },
  successActionBtn: {
    padding: "10px 20px",
    backgroundColor: "#10b981",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    fontWeight: "600",
    cursor: "pointer",
  },
  dangerActionBtn: {
    padding: "10px 20px",
    backgroundColor: "#ef4444",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    fontWeight: "600",
    cursor: "pointer",
  },
  eventsList: { display: "flex", flexDirection: "column", gap: "16px" },
  eventItem: { display: "flex", alignItems: "center", gap: "14px" },
  eventIcon: {
    fontSize: "18px",
    backgroundColor: "#f1f5f9",
    padding: "10px",
    borderRadius: "8px",
  },
  eventTitle: { margin: 0, fontSize: "15px", fontWeight: "600", color: "#0f172a" },
  eventSub: { margin: "2px 0 0 0", fontSize: "13px", color: "#64748b" },
  profileHeader: { display: "flex", alignItems: "center", gap: "16px" },
  avatar: {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    fontWeight: "bold",
  },
  hr: { border: "none", borderTop: "1px solid #e2e8f0", margin: "20px 0" },
  detailsGrid: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px" },
  detailLabel: {
    fontSize: "11px",
    color: "#64748b",
    textTransform: "uppercase",
    fontWeight: "600",
  },
  detailValue: { fontSize: "15px", color: "#0f172a", fontWeight: "500", margin: "4px 0 0 0" },
  cleanInput: {
    width: "100%",
    padding: "8px 12px",
    marginTop: "4px",
    borderRadius: "6px",
    border: "1px solid #cbd5e1",
    backgroundColor: "#ffffff",
    color: "#0f172a",
    boxSizing: "border-box",
  },
  lightBoxDisplay: {
    backgroundColor: "#f1f5f9",
    padding: "15px",
    borderRadius: "8px",
    margin: "15px 0",
    textAlign: "center",
  },
  otBox: {
    marginTop: "16px",
    padding: "12px",
    backgroundColor: "#dbeafe",
    borderRadius: "8px",
    border: "1px solid #bfdbfe",
  },
  table: { width: "100%", borderCollapse: "collapse", marginTop: "10px" },
  th: {
    borderBottom: "2px solid #cbd5e1",
    textAlign: "left",
    padding: "10px 8px",
    fontSize: "12px",
    color: "#475569",
    fontWeight: "bold",
  },
  td: { borderBottom: "1px solid #e2e8f0", padding: "10px 8px", fontSize: "13px", color: "#0f172a" },
  payslipPaper: {
    backgroundColor: "#ffffff",
    border: "1px solid #cbd5e1",
    borderRadius: "12px",
    padding: "24px",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
  },
  payslipHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  badgeLabel: {
    backgroundColor: "#2563eb",
    color: "#ffffff",
    padding: "4px 8px",
    borderRadius: "4px",
    fontSize: "11px",
    fontWeight: "bold",
  },
  empInfoGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
    marginBottom: "16px",
  },
  netPayBox: {
    marginTop: "16px",
    padding: "14px",
    backgroundColor: "#f0fdf4",
    border: "1px solid #bbf7d0",
    borderRadius: "8px",
  },
};

export default EmployeePortal;