const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = 'your_super_secret_jwt_key_123';

app.use(cors());
app.use(express.json());

// Database Connection
const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error('Database connection error:', err.message);
  else console.log('Connected to SQLite Database');
});

// Database Initialization & Seed Users
db.serialize(() => {
  // 1. Users Table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'employee',
      name TEXT
    )
  `);

  // 2. Employees Table
  db.run(`
    CREATE TABLE IF NOT EXISTS employees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      department TEXT,
      role TEXT,
      salary REAL
    )
  `);

  // 3. Payroll Table
  db.run(`
    CREATE TABLE IF NOT EXISTS payroll (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employeeId INTEGER,
      employeeName TEXT,
      month TEXT,
      basicSalary REAL,
      hra REAL,
      da REAL,
      taxDeduction REAL,
      netPay REAL,
      status TEXT DEFAULT 'Pending'
    )
  `);

  // 4. Attendance Table
  db.run(`
    CREATE TABLE IF NOT EXISTS attendance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER,
      date TEXT,
      punchIn TEXT,
      punchOut TEXT,
      status TEXT
    )
  `);

  // 5. Leaves Table
  db.run(`
    CREATE TABLE IF NOT EXISTS leaves (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER,
      userEmail TEXT,
      leaveType TEXT,
      reason TEXT,
      status TEXT DEFAULT 'Pending',
      createdAt TEXT
    )
  `);
  // 6. Job Applications Table
  db.run(`
    CREATE TABLE IF NOT EXISTS job_applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      applicantName TEXT NOT NULL,
      email TEXT NOT NULL,
      position TEXT NOT NULL,
      status TEXT DEFAULT 'Under Review',
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);


  // Seed Default Admin User
  db.get('SELECT * FROM users WHERE email = ?', ['admin@company.com'], async (err, user) => {
    if (!user) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      db.run(
        'INSERT INTO users (email, password, role, name) VALUES (?, ?, ?, ?)',
        ['admin@company.com', hashedPassword, 'admin', 'System Admin']
      );
      console.log('Default Admin Seeded: admin@company.com / admin123');
    }
  });

  // Seed Default Employee User
  
db.get(
  'SELECT * FROM users WHERE email = ?',
  ['shubham.k@company.com'],
  async (err, user) => {
    if (err) {
      console.error('Error checking Shubham user:', err.message);
      return;
    }

    if (!user) {
      const hashedPassword = await bcrypt.hash('emp123', 10);

      db.run(
        'INSERT INTO users (email, password, role, name) VALUES (?, ?, ?, ?)',
        [
          'shubham.k@company.com',
          hashedPassword,
          'employee',
          'Shubham Kokane'
        ],
        (insertErr) => {
          if (insertErr) {
            console.error('Error creating Shubham login:', insertErr.message);
          } else {
            console.log('Shubham login created: shubham.k@company.com');
          }
        }
      );
    }
  }

);
});

// ================= AUTHENTICATION ROUTES =================
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and Password are required' });
  }

  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(400).json({ message: 'Invalid Email or Password' });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(400).json({ message: 'Invalid Email or Password' });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login Successful',
      token,
      user: { id: user.id, email: user.email, role: user.role, name: user.name || user.email.split('@')[0] }
    });
  });
});

// ================= EMPLOYEE MANAGEMENT ROUTES =================
app.get('/api/employees', (req, res) => {
  db.all('SELECT * FROM employees ORDER BY id DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows || []);
  });
});

app.post('/api/employees', (req, res) => {
  const { name, email, department, role, salary } = req.body;
  db.run(
    'INSERT INTO employees (name, email, department, role, salary) VALUES (?, ?, ?, ?, ?)',
    [name, email, department, role, salary],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID, name, email, department, role, salary });
    }
  );
});

app.delete('/api/employees/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM employees WHERE id = ?', [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Employee deleted successfully' });
  });
});

app.put('/api/employees/:id', (req, res) => {
  const { id } = req.params;
  const { salary } = req.body;

  if (
    salary === undefined ||
    !Number.isFinite(Number(salary)) ||
    Number(salary) < 0
  ) {
    return res.status(400).json({ error: 'Invalid salary' });
  }

  db.run(
    'UPDATE employees SET salary = ? WHERE id = ?',
    [Number(salary), id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Employee not found' });
      }

      res.json({
        message: 'Salary updated successfully',
        id,
        salary: Number(salary)
      });
    }
  );
});


app.put('/api/employees/:id/email', (req, res) => {
  const { id } = req.params;
  const { email } = req.body;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  db.run(
    'UPDATE employees SET email = ? WHERE id = ?',
    [email.trim().toLowerCase(), id],
    function (err) {
      if (err) {
        if (err.message.includes('UNIQUE')) {
          return res.status(409).json({ error: 'Email already exists' });
        }
        return res.status(500).json({ error: err.message });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Employee not found' });
      }

      res.json({
        message: 'Employee email updated successfully',
        id: Number(id),
        email: email.trim().toLowerCase()
      });
    }
  );
});


 // ================= JOB APPLICATIONS ROUTES =================

 app.get('/api/applications', (req, res) => {
   db.all(
     'SELECT * FROM job_applications ORDER BY id DESC',
     [],
     (err, rows) => {
       if (err) return res.status(500).json({ error: err.message });
       res.json(rows || []);
     }
   );
 });

 
app.put('/api/applications/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const allowedStatuses = ['Under Review', 'Shortlisted', 'Rejected'];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  db.run(
    'UPDATE job_applications SET status = ? WHERE id = ?',
    [status, id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Application not found' });
      }

      res.json({
        message: 'Application status updated successfully',
        id: Number(id),
        status
      });
    }
  );
});



 app.post('/api/applications', (req, res) => {
  const { applicantName, email, position } = req.body;

  if (!applicantName || !email || !position) {
    return res.status(400).json({
      error: 'Applicant name, email and position are required'
    });
  }

  db.run(
    `INSERT INTO job_applications
      (applicantName, email, position, status)
     VALUES (?, ?, ?, 'Under Review')`,
    [applicantName, email, position],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.status(201).json({
        id: this.lastID,
        applicantName,
        email,
        position,
        status: 'Under Review'
      });
    }
  );
});

app.put('/api/applications/:id/status', (req, res) => {
  const { status } = req.body;
  const allowedStatuses = ['Under Review', 'Shortlisted', 'Rejected'];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  db.run(
    'UPDATE job_applications SET status = ? WHERE id = ?',
    [status, req.params.id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Application not found' });
      }

      res.json({
        message: 'Application status updated',
        id: Number(req.params.id),
        status
      });
    }
  );
});


app.put('/api/employees/update-salary', (req, res) => {
  const { email, salary } = req.body;

  if (!email || salary === undefined || Number(salary) < 50000) {
    return res.status(400).json({
      error: 'Valid email and salary of at least 50000 are required'
    });
  }

  db.run(
    'UPDATE employees SET salary = ? WHERE email = ?',
    [Number(salary), email],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (this.changes === 0) {
        return res.status(404).json({
          error: 'Employee not found'
        });
      }

      res.json({
        message: 'Salary updated successfully',
        email,
        salary: Number(salary)
      });
    }
  );
});

app.delete('/api/employees/:email', (req, res) => {
  const email = req.params.email;

  db.run(
    'DELETE FROM employees WHERE email = ?',
    [email],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Employee not found' });
      }

      res.json({ message: 'Employee deleted successfully', email });
    }
  );
});

// ================= PAYROLL ROUTES =================
// ================= PAYROLL ROUTES =================

app.get('/api/payroll', (req, res) => {
  db.all('SELECT * FROM payroll ORDER BY id DESC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows || []);
  });
});

app.post('/api/payroll', (req, res) => {
  const { employeeId, employeeName, month, basicSalary } = req.body;
  const basic = parseFloat(basicSalary) || 0;

  const hra = basic * 0.20;
  const da = basic * 0.10;
  const gross = basic + hra + da;
  const taxDeduction = gross * 0.10;
  const netPay = gross - taxDeduction;

  db.run(
    `INSERT INTO payroll
    (employeeId, employeeName, month, basicSalary, hra, da, taxDeduction, netPay, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Pending')`,
    [employeeId, employeeName, month, basic, hra, da, taxDeduction, netPay],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.status(201).json({
        message: 'Payroll generated successfully',
        id: this.lastID
      });
    }
  );
});

// ================= ATTENDANCE ROUTES =================
app.get('/api/attendance', (req, res) => {
  db.all('SELECT * FROM attendance ORDER BY id DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows || []);
  });
});

app.post('/api/attendance/punch', (req, res) => {
  const { userId, type } = req.body;
  const today = new Date().toISOString().split('T')[0];
  const currentTime = new Date().toLocaleTimeString();

  if (type === 'in') {
    db.run(
      'INSERT INTO attendance (userId, date, punchIn, status) VALUES (?, ?, ?, ?)',
      [userId, today, currentTime, 'Present'],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Punched In Successfully', punchIn: currentTime });
      }
    );
  } else {
    db.run(
      'UPDATE attendance SET punchOut = ? WHERE userId = ? AND date = ?',
      [currentTime, userId, today],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Punched Out Successfully', punchOut: currentTime });
      }
    );
  }
});

// ================= LEAVES ROUTES =================
app.get('/api/leaves', (req, res) => {
  db.all('SELECT * FROM leaves ORDER BY id DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows || []);
  });
});

app.post('/api/leaves/request', (req, res) => {
  const { userId, userEmail, leaveType, reason } = req.body;
  const createdAt = new Date().toISOString().split('T')[0];

  db.run(
    'INSERT INTO leaves (userId, userEmail, leaveType, reason, createdAt) VALUES (?, ?, ?, ?, ?)',
    [userId, userEmail, leaveType, reason, createdAt],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Leave Request Submitted' });
    }
  );
});

app.put('/api/leaves/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  db.run('UPDATE leaves SET status = ? WHERE id = ?', [status, id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: `Leave Request ${status}` });
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Backend Server running on http://localhost:${PORT}`);
});