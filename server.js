// ============================================================
//  SRMS Backend Server — server.js
//  Run: node server.js
//  API runs on: http://localhost:3000
// ============================================================

const express = require('express');
const mysql   = require('mysql2');
const cors    = require('cors');
const path    = require('path');

const app  = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// ── Serve the HTML frontend ──────────────────────────────
app.use(express.static(path.join(__dirname)));

// ── MySQL Connection ─────────────────────────────────────
const db = mysql.createConnection({
  host    : 'localhost',
  user    : 'root',
<<<<<<< HEAD
  password: 'omsairam@17',    // ← CHANGE THIS to your MySQL root password
=======
  password: '24BDS1164',    // ← CHANGE THIS to your MySQL root password
>>>>>>> 13e04ca37b6bf11b2d6702c99e20997424e0a8df
  database: 'srms_db'
});

db.connect(err => {
  if (err) {
    console.error('❌  MySQL connection failed:', err.message);
    console.log('👉  Make sure MySQL is running and password is correct in server.js');
    process.exit(1);
  }
  console.log('✅  Connected to MySQL — srms_db');
  console.log(`🌐  Open your browser: http://localhost:${PORT}`);
});

// ── Helper: run query as Promise ─────────────────────────
function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
}

// ════════════════════════════════════════════════════════
//  USERS — CRUD
// ════════════════════════════════════════════════════════

// GET all users
app.get('/api/users', async (req, res) => {
  try {
    const users = await query(`
      SELECT u.User_ID, u.First_Name, u.Last_Name, u.Email, u.Role, u.Department,
             GROUP_CONCAT(p.Phone_No) AS Phones
      FROM USER u
      LEFT JOIN USER_PHONE p ON u.User_ID = p.User_ID
      GROUP BY u.User_ID
      ORDER BY u.User_ID
    `);
    res.json({ success: true, data: users });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

// GET single user
app.get('/api/users/:id', async (req, res) => {
  try {
    const rows = await query('SELECT * FROM USER WHERE User_ID = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, error: 'User not found' });
    res.json({ success: true, data: rows[0] });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

// POST create user (INSERT)
app.post('/api/users', async (req, res) => {
  const { First_Name, Last_Name, Email, Role, Department, Phone_No } = req.body;
  if (!First_Name || !Last_Name || !Email || !Role)
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  try {
    const result = await query(
      'INSERT INTO USER (First_Name, Last_Name, Email, Role, Department) VALUES (?,?,?,?,?)',
      [First_Name, Last_Name, Email, Role, Department || 'General']
    );
    const newId = result.insertId;
    // Insert phone if provided
    if (Phone_No) {
      await query('INSERT INTO USER_PHONE VALUES (?,?)', [newId, Phone_No]);
    }
    res.json({ success: true, insertId: newId, message: `User added with ID ${newId}` });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

// PUT update user (UPDATE)
app.put('/api/users/:id', async (req, res) => {
  const { First_Name, Last_Name, Email, Role, Department } = req.body;
  try {
    await query(
      'UPDATE USER SET First_Name=?, Last_Name=?, Email=?, Role=?, Department=? WHERE User_ID=?',
      [First_Name, Last_Name, Email, Role, Department, req.params.id]
    );
    res.json({ success: true, message: `User ${req.params.id} updated` });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

// DELETE user (DELETE — cascades to USER_PHONE and RESOURCE_ALLOCATION)
app.delete('/api/users/:id', async (req, res) => {
  try {
    await query('DELETE FROM USER WHERE User_ID = ?', [req.params.id]);
    res.json({ success: true, message: `User ${req.params.id} deleted` });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

// ════════════════════════════════════════════════════════
//  SERVERS — CRUD
// ════════════════════════════════════════════════════════

// GET all servers
app.get('/api/servers', async (req, res) => {
  try {
    const servers = await query('SELECT * FROM SERVER ORDER BY Server_ID');
    res.json({ success: true, data: servers });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

// POST create server (INSERT)
app.post('/api/servers', async (req, res) => {
  const { Server_Name, CPU_Capacity, RAM_Capacity, Storage_Capacity, Data_Center, Rack_No, Status } = req.body;
  if (!Server_Name || !CPU_Capacity || !RAM_Capacity || !Storage_Capacity || !Data_Center || !Rack_No)
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  try {
    const result = await query(
      'INSERT INTO SERVER (Server_Name,CPU_Capacity,RAM_Capacity,Storage_Capacity,Data_Center,Rack_No,Status) VALUES (?,?,?,?,?,?,?)',
      [Server_Name, CPU_Capacity, RAM_Capacity, Storage_Capacity, Data_Center, Rack_No, Status || 'Active']
    );
    res.json({ success: true, insertId: result.insertId, message: `Server added with ID ${result.insertId}` });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

// PUT update server (UPDATE)
app.put('/api/servers/:id', async (req, res) => {
  const { Server_Name, CPU_Capacity, RAM_Capacity, Storage_Capacity, Data_Center, Rack_No, Status } = req.body;
  try {
    await query(
      'UPDATE SERVER SET Server_Name=?,CPU_Capacity=?,RAM_Capacity=?,Storage_Capacity=?,Data_Center=?,Rack_No=?,Status=? WHERE Server_ID=?',
      [Server_Name, CPU_Capacity, RAM_Capacity, Storage_Capacity, Data_Center, Rack_No, Status, req.params.id]
    );
    res.json({ success: true, message: `Server ${req.params.id} updated` });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

// DELETE server
app.delete('/api/servers/:id', async (req, res) => {
  try {
    await query('DELETE FROM SERVER WHERE Server_ID = ?', [req.params.id]);
    res.json({ success: true, message: `Server ${req.params.id} deleted` });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

// ════════════════════════════════════════════════════════
//  RESOURCE_ALLOCATION — CRUD
// ════════════════════════════════════════════════════════

// GET all allocations with JOINed user and server names
app.get('/api/allocations', async (req, res) => {
  try {
    const rows = await query(`
      SELECT ra.*,
             CONCAT(u.First_Name,' ',u.Last_Name) AS User_Name,
             s.Server_Name
      FROM RESOURCE_ALLOCATION ra
      JOIN USER   u ON ra.User_ID   = u.User_ID
      JOIN SERVER s ON ra.Server_ID = s.Server_ID
      ORDER BY ra.Allocation_ID
    `);
    res.json({ success: true, data: rows });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

// POST create allocation (INSERT)
app.post('/api/allocations', async (req, res) => {
  const { User_ID, Server_ID, Allocation_Date, Release_Date, Allocated_CPU, Allocated_RAM, Allocated_Storage } = req.body;
  if (!User_ID || !Server_ID || !Allocation_Date || !Allocated_CPU || !Allocated_RAM || !Allocated_Storage)
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  try {
    const result = await query(
      'INSERT INTO RESOURCE_ALLOCATION (User_ID,Server_ID,Allocation_Date,Release_Date,Allocated_CPU,Allocated_RAM,Allocated_Storage) VALUES (?,?,?,?,?,?,?)',
      [User_ID, Server_ID, Allocation_Date, Release_Date || null, Allocated_CPU, Allocated_RAM, Allocated_Storage]
    );
    res.json({ success: true, insertId: result.insertId, message: `Allocation created with ID ${result.insertId}` });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

// PUT update allocation (UPDATE release date)
app.put('/api/allocations/:id', async (req, res) => {
  const { Release_Date, Allocated_CPU, Allocated_RAM, Allocated_Storage } = req.body;
  try {
    await query(
      'UPDATE RESOURCE_ALLOCATION SET Release_Date=?,Allocated_CPU=?,Allocated_RAM=?,Allocated_Storage=? WHERE Allocation_ID=?',
      [Release_Date || null, Allocated_CPU, Allocated_RAM, Allocated_Storage, req.params.id]
    );
    res.json({ success: true, message: `Allocation ${req.params.id} updated` });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

// DELETE allocation
app.delete('/api/allocations/:id', async (req, res) => {
  try {
    await query('DELETE FROM RESOURCE_ALLOCATION WHERE Allocation_ID = ?', [req.params.id]);
    res.json({ success: true, message: `Allocation ${req.params.id} deleted` });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

// ════════════════════════════════════════════════════════
//  MAINTENANCE — CRUD
// ════════════════════════════════════════════════════════

// GET all maintenance with server name
app.get('/api/maintenance', async (req, res) => {
  try {
    const rows = await query(`
      SELECT m.*, s.Server_Name
      FROM MAINTENANCE m
      JOIN SERVER s ON m.Server_ID = s.Server_ID
      ORDER BY m.Maintenance_Date DESC
    `);
    res.json({ success: true, data: rows });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

// POST create maintenance (INSERT)
app.post('/api/maintenance', async (req, res) => {
  const { Server_ID, Maintenance_Date, Description, Tech_First_Name, Tech_Last_Name, Maintenance_Status, Priority } = req.body;
  if (!Server_ID || !Maintenance_Date || !Tech_First_Name || !Tech_Last_Name)
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  try {
    const result = await query(
      'INSERT INTO MAINTENANCE (Server_ID,Maintenance_Date,Description,Tech_First_Name,Tech_Last_Name,Maintenance_Status,Priority) VALUES (?,?,?,?,?,?,?)',
      [Server_ID, Maintenance_Date, Description || '', Tech_First_Name, Tech_Last_Name, Maintenance_Status || 'Pending', Priority || 'Medium']
    );
    // Auto-update server status if maintenance is In Progress
    if (Maintenance_Status === 'In Progress') {
      await query("UPDATE SERVER SET Status='Under Maintenance' WHERE Server_ID=?", [Server_ID]);
    }
    res.json({ success: true, insertId: result.insertId, message: `Maintenance record created with ID ${result.insertId}` });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

// PUT update maintenance status (UPDATE)
app.put('/api/maintenance/:id', async (req, res) => {
  const { Maintenance_Status, Priority, Description } = req.body;
  try {
    const rows = await query('SELECT Server_ID FROM MAINTENANCE WHERE Maintenance_ID=?', [req.params.id]);
    await query(
      'UPDATE MAINTENANCE SET Maintenance_Status=?,Priority=?,Description=? WHERE Maintenance_ID=?',
      [Maintenance_Status, Priority || 'Medium', Description, req.params.id]
    );
    // If completed, set server back to Active
    if (Maintenance_Status === 'Completed' && rows.length) {
      await query("UPDATE SERVER SET Status='Active' WHERE Server_ID=?", [rows[0].Server_ID]);
    }
    res.json({ success: true, message: `Maintenance ${req.params.id} updated` });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

// DELETE maintenance
app.delete('/api/maintenance/:id', async (req, res) => {
  try {
    await query('DELETE FROM MAINTENANCE WHERE Maintenance_ID = ?', [req.params.id]);
    res.json({ success: true, message: `Maintenance record ${req.params.id} deleted` });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

// ════════════════════════════════════════════════════════
//  SQL QUERY RUNNER — Execute any SELECT safely
// ════════════════════════════════════════════════════════
app.post('/api/query', async (req, res) => {
  const { sql } = req.body;
  if (!sql) return res.status(400).json({ success: false, error: 'No SQL provided' });

  const sqlLower = sql.trim().toLowerCase();

  // Allow SELECT, UPDATE, DELETE, ALTER for demo purposes
  const allowed = ['select','update','delete','alter','insert','show','describe'];
  const isAllowed = allowed.some(cmd => sqlLower.startsWith(cmd));
  if (!isAllowed) return res.status(403).json({ success: false, error: 'Only SELECT/UPDATE/DELETE/ALTER/INSERT allowed' });

  try {
    const start = Date.now();
    const results = await query(sql);
    const elapsed = Date.now() - start;

    if (Array.isArray(results)) {
      res.json({ success: true, type: 'select', rows: results, count: results.length, time: elapsed });
    } else {
      res.json({
        success: true, type: 'modify',
        affectedRows: results.affectedRows,
        message: `Query OK — ${results.affectedRows} row(s) affected`,
        time: elapsed
      });
    }
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

// ── Dashboard stats ──────────────────────────────────────
app.get('/api/stats', async (req, res) => {
  try {
    const [users]   = await query('SELECT COUNT(*) AS cnt FROM USER');
    const [servers] = await query("SELECT COUNT(*) AS cnt FROM SERVER WHERE Status='Active'");
    const [alloc]   = await query('SELECT COUNT(*) AS cnt FROM RESOURCE_ALLOCATION');
    const [maint]   = await query('SELECT COUNT(*) AS cnt FROM MAINTENANCE');
    const cpuData   = await query('SELECT Server_Name, CPU_Capacity FROM SERVER');
    const ramData   = await query('SELECT Server_Name, RAM_Capacity FROM SERVER');
    const maintStatus = await query('SELECT Maintenance_Status, COUNT(*) AS cnt FROM MAINTENANCE GROUP BY Maintenance_Status');
    const allocUser   = await query(`
      SELECT CONCAT(u.First_Name,' ',u.Last_Name) AS name, COUNT(*) AS cnt
      FROM RESOURCE_ALLOCATION ra JOIN USER u ON ra.User_ID=u.User_ID
      GROUP BY ra.User_ID
    `);
    res.json({ success:true, users:users.cnt, servers:servers.cnt, allocations:alloc.cnt,
               maintenance:maint.cnt, cpuData, ramData, maintStatus, allocUser });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

// ── Start server ─────────────────────────────────────────
app.listen(PORT, () => {
  console.log('');
  console.log('╔══════════════════════════════════════════╗');
  console.log('║   SRMS Backend Server — RUNNING          ║');
  console.log(`║   URL: http://localhost:${PORT}             ║`);
  console.log('║   Database: srms_db (MySQL)              ║');
  console.log('╚══════════════════════════════════════════╝');
  console.log('');
});
