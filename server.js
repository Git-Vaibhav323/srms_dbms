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
  password: '24BDS1164',    // ← CHANGE THIS to your MySQL root password
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

// ════════════════════════════════════════════════════════
//  PDF REPORT GENERATOR
// ════════════════════════════════════════════════════════
const PDFDocument = require('pdfkit');

app.get('/api/report', async (req, res) => {
  try {
    // Fetch all data
    const users       = await query(`SELECT u.*, GROUP_CONCAT(p.Phone_No) AS Phones FROM USER u LEFT JOIN USER_PHONE p ON u.User_ID=p.User_ID GROUP BY u.User_ID`);
    const servers     = await query('SELECT * FROM SERVER ORDER BY Server_ID');
    const allocations = await query(`SELECT ra.*, CONCAT(u.First_Name,' ',u.Last_Name) AS User_Name, s.Server_Name FROM RESOURCE_ALLOCATION ra JOIN USER u ON ra.User_ID=u.User_ID JOIN SERVER s ON ra.Server_ID=s.Server_ID ORDER BY ra.Allocation_ID`);
    const maintenance = await query(`SELECT m.*, s.Server_Name FROM MAINTENANCE m JOIN SERVER s ON m.Server_ID=s.Server_ID ORDER BY m.Maintenance_Date DESC`);
    const activeServers = servers.filter(s => s.Status === 'Active').length;
    const activeAllocs  = allocations.filter(a => !a.Release_Date).length;
    const pendingMaint  = maintenance.filter(m => m.Maintenance_Status !== 'Completed').length;

    // Create PDF
    const doc = new PDFDocument({ margin: 50, size: 'A4', compress: true, bufferPages: true });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="SRMS_Report.pdf"');
    doc.pipe(res);

    const W = 495; // usable width
    const BLUE = '#1e40af', LIGHTBLUE = '#dbeafe', DARKBG = '#0f172a';
    const CYAN = '#0891b2', GREEN = '#059669', ORANGE = '#d97706', RED = '#dc2626';
    const GRAY = '#64748b', LIGHTGRAY = '#f1f5f9', BORDER = '#e2e8f0';
    const TEXT = '#1e293b', TEXT2 = '#475569';

    // ── Helper functions ──────────────────────────────
    function drawRect(x, y, w, h, color, radius=0) {
      doc.save().roundedRect(x, y, w, h, radius).fill(color).restore();
    }
    function hline(y, color='#e2e8f0') {
      doc.save().moveTo(50, y).lineTo(545, y).strokeColor(color).lineWidth(0.5).stroke().restore();
    }
    function sectionHeader(title, y) {
      drawRect(50, y, W, 28, BLUE, 4);
      doc.font('Helvetica-Bold').fontSize(11).fillColor('white').text(title, 58, y+8);
      return y + 38;
    }
    function tableHeader(cols, widths, y) {
      drawRect(50, y, W, 22, '#1e293b', 0);
      let x = 50;
      cols.forEach((c, i) => {
        doc.font('Helvetica-Bold').fontSize(8).fillColor('white')
           .text(c, x+4, y+7, { width: widths[i]-6, ellipsis: true });
        x += widths[i];
      });
      return y + 22;
    }
    function rowHeight(cols, widths, fontSize = 8, minHeight = 18) {
      const padY = 5;
      const heights = cols.map((c, i) => {
        const text = String(c ?? '—');
        doc.font('Helvetica').fontSize(fontSize);
        return doc.heightOfString(text, { width: widths[i] - 8, align: 'left' });
      });
      return Math.max(minHeight, Math.ceil(Math.max(...heights) + padY * 2));
    }
    function tableRow(cols, widths, y, shade) {
      const h = rowHeight(cols, widths, 8, 18);
      if (shade) drawRect(50, y, W, h, LIGHTGRAY, 0);
      let x = 50;
      cols.forEach((c, i) => {
        doc.font('Helvetica').fontSize(8).fillColor(TEXT)
           .text(String(c ?? '—'), x+4, y+5, { width: widths[i]-8, align: 'left' });
        x += widths[i];
      });
      doc.save().rect(50, y, W, h).strokeColor(BORDER).lineWidth(0.3).stroke().restore();
      return y + h;
    }
    function statCard(x, y, w, label, value, color) {
      drawRect(x, y, w, 56, 'white', 6);
      doc.save().roundedRect(x, y, w, 56, 6).strokeColor(color).lineWidth(1.5).stroke().restore();
      drawRect(x, y, 4, 56, color, 0);
      doc.font('Helvetica-Bold').fontSize(22).fillColor(color).text(String(value), x+14, y+8);
      doc.font('Helvetica').fontSize(9).fillColor(GRAY).text(label, x+14, y+34, { width: w-20 });
    }

    // ══════════════════════════════════════════════
    // PAGE 1 — COVER + SUMMARY
    // ══════════════════════════════════════════════
    // Header banner
    drawRect(0, 0, 595, 110, DARKBG, 0);
    doc.font('Helvetica-Bold').fontSize(26).fillColor('white').text('SRMS System Report', 50, 28);
    doc.font('Helvetica').fontSize(11).fillColor('#94a3b8').text('Server Resource Management System', 50, 60);
    doc.font('Helvetica').fontSize(9).fillColor('#64748b').text(`Generated on: ${new Date().toLocaleString('en-IN', {timeZone:'Asia/Kolkata'})}`, 50, 78);
    // Right side accent
    drawRect(490, 0, 105, 110, BLUE, 0);
    doc.font('Helvetica-Bold').fontSize(10).fillColor('white').text('VIT Chennai', 495, 30);
    doc.font('Helvetica').fontSize(8).fillColor('#93c5fd').text('BCSE302L', 495, 46);
    doc.font('Helvetica').fontSize(8).fillColor('#93c5fd').text('DA3 Project', 495, 58);
    doc.font('Helvetica').fontSize(8).fillColor('#93c5fd').text('Sahil Poply', 495, 74);
    doc.font('Helvetica').fontSize(8).fillColor('#93c5fd').text('Vaibhav Dwivedi', 495, 86);

    let y = 130;

    // Summary stat cards
    doc.font('Helvetica-Bold').fontSize(13).fillColor(TEXT).text('Summary Statistics', 50, y);
    hline(y + 18);
    y += 26;
    const cw = (W - 15) / 4;
    statCard(50,             y, cw, 'Total Users',      users.length,       BLUE);
    statCard(50+cw+5,        y, cw, 'Active Servers',   activeServers,      CYAN);
    statCard(50+(cw+5)*2,    y, cw, 'Total Allocations',allocations.length, '#7c3aed');
    statCard(50+(cw+5)*3,    y, cw, 'Maintenance Recs', maintenance.length, GREEN);
    y += 72;

    // Quick KPIs
    drawRect(50, y, W, 40, LIGHTBLUE, 6);
    doc.font('Helvetica-Bold').fontSize(9).fillColor(BLUE).text('KEY INDICATORS', 60, y+6);
    const kpis = [
      `Active Allocations: ${activeAllocs}`,
      `Servers Under Maintenance: ${servers.filter(s=>s.Status!=='Active').length}`,
      `Pending Maintenance: ${pendingMaint}`,
      `Completed Maintenance: ${maintenance.filter(m=>m.Maintenance_Status==='Completed').length}`
    ];
    doc.font('Helvetica').fontSize(9).fillColor(TEXT2).text(kpis.join('   •   '), 60, y+20, { width: W-20 });
    y += 52;

    // System Overview
    doc.font('Helvetica-Bold').fontSize(13).fillColor(TEXT).text('System Overview', 50, y);
    hline(y + 18);
    y += 26;

    // Maintenance Status mini chart (text-based)
    const mCounts = { Completed:0, 'In Progress':0, Pending:0 };
    maintenance.forEach(m => mCounts[m.Maintenance_Status] = (mCounts[m.Maintenance_Status]||0)+1);
    const mColors = { Completed: GREEN, 'In Progress': ORANGE, Pending: RED };

    drawRect(50, y, 235, 100, LIGHTGRAY, 6);
    doc.font('Helvetica-Bold').fontSize(9).fillColor(TEXT2).text('Maintenance Status Distribution', 58, y+8);
    let my = y + 24;
    Object.entries(mCounts).forEach(([label, count]) => {
      const pct = maintenance.length ? Math.round(count/maintenance.length*100) : 0;
      const bw = Math.max(4, Math.round(180 * pct/100));
      drawRect(58, my, bw, 14, mColors[label], 3);
      doc.font('Helvetica').fontSize(8).fillColor('white').text(`${label}: ${count} (${pct}%)`, 62, my+3, { width: bw-4 });
      my += 20;
    });

    // CPU by Server mini chart
    drawRect(305, y, 240, 100, LIGHTGRAY, 6);
    doc.font('Helvetica-Bold').fontSize(9).fillColor(TEXT2).text('CPU Capacity by Server', 313, y+8);
    const maxCpu = Math.max(...servers.map(s => s.CPU_Capacity));
    let sy = y + 24;
    servers.slice(0,4).forEach(s => {
      const bw = Math.max(4, Math.round(180 * s.CPU_Capacity/maxCpu));
      drawRect(313, sy, bw, 12, BLUE, 2);
      doc.font('Helvetica').fontSize(7).fillColor(TEXT2).text(`${s.Server_Name}: ${s.CPU_Capacity}c`, 313, sy+16, { width: 190 });
      sy += 22;
    });
    y += 116;

    // ══════════════════════════════════════════════
    // PAGE 1 — USERS TABLE
    // ══════════════════════════════════════════════
    y = sectionHeader('1. USER TABLE  (' + users.length + ' records)', y + 10);
    const uW = [35, 80, 80, 145, 95, 60];
    y = tableHeader(['ID','First Name','Last Name','Email','Role','Phone'], uW, y);
    users.forEach((u, i) => {
      const row = [u.User_ID, u.First_Name, u.Last_Name, u.Email, u.Role, u.Phones||'—'];
      const h = rowHeight(row, uW);
      if (y + h > 790) { doc.addPage(); y = 50; y = tableHeader(['ID','First Name','Last Name','Email','Role','Phone'], uW, y); }
      y = tableRow(row, uW, y, i%2===0);
    });

    // ══════════════════════════════════════════════
    // PAGE 2 — SERVERS + ALLOCATIONS
    // ══════════════════════════════════════════════
    doc.addPage();
    y = 50;
    y = sectionHeader('2. SERVER TABLE  (' + servers.length + ' records)', y);
    const sW = [35, 85, 60, 60, 65, 95, 45, 50];
    y = tableHeader(['ID','Name','CPU','RAM(GB)','Store(GB)','Data Center','Rack','Status'], sW, y);
    servers.forEach((s, i) => {
      const row = [s.Server_ID, s.Server_Name, s.CPU_Capacity+'c', s.RAM_Capacity+'GB', s.Storage_Capacity+'GB', s.Data_Center, s.Rack_No, s.Status];
      const h = rowHeight(row, sW);
      if (y + h > 790) { doc.addPage(); y = 50; y = tableHeader(['ID','Name','CPU','RAM(GB)','Store(GB)','Data Center','Rack','Status'], sW, y); }
      y = tableRow(row, sW, y, i%2===0);
    });

    // Server utilization summary
    y += 10;
    drawRect(50, y, W, 32, '#ecfdf5', 6);
    doc.font('Helvetica-Bold').fontSize(9).fillColor(GREEN).text('Server Capacity Summary', 60, y+5);
    const totalCpu = servers.reduce((a,s)=>a+s.CPU_Capacity,0);
    const totalRam = servers.reduce((a,s)=>a+s.RAM_Capacity,0);
    const totalSt  = servers.reduce((a,s)=>a+s.Storage_Capacity,0);
    doc.font('Helvetica').fontSize(9).fillColor(TEXT2)
       .text(`Total CPU: ${totalCpu} cores   |   Total RAM: ${totalRam} GB   |   Total Storage: ${totalSt.toLocaleString()} GB   |   Active: ${activeServers}/${servers.length}`, 60, y+18, {width:W-20});
    y += 48;

    y = sectionHeader('3. RESOURCE ALLOCATION TABLE  (' + allocations.length + ' records)', y);
    const aW = [30, 95, 85, 75, 75, 45, 45, 45];
    y = tableHeader(['ID','User','Server','Alloc Date','Release Date','CPU','RAM','Storage'], aW, y);
    allocations.forEach((a, i) => {
      const rd = a.Release_Date ? new Date(a.Release_Date).toLocaleDateString('en-IN') : 'Active';
      const ad = a.Allocation_Date ? new Date(a.Allocation_Date).toLocaleDateString('en-IN') : '—';
      const row = [a.Allocation_ID, a.User_Name, a.Server_Name, ad, rd, a.Allocated_CPU+'c', a.Allocated_RAM+'GB', a.Allocated_Storage+'GB'];
      const h = rowHeight(row, aW);
      if (y + h > 790) { doc.addPage(); y = 50; y = tableHeader(['ID','User','Server','Alloc Date','Release Date','CPU','RAM','Storage'], aW, y); }
      y = tableRow(row, aW, y, i%2===0);
    });

    // ══════════════════════════════════════════════
    // PAGE 3 — MAINTENANCE + SQL QUERIES
    // ══════════════════════════════════════════════
    doc.addPage();
    y = 50;
    y = sectionHeader('4. MAINTENANCE TABLE  (' + maintenance.length + ' records)', y);
    const mW = [30, 80, 70, 175, 70, 40, 30];
    y = tableHeader(['ID','Server','Date','Description','Technician','Status','Pri'], mW, y);
    maintenance.forEach((m, i) => {
      const md = m.Maintenance_Date ? new Date(m.Maintenance_Date).toLocaleDateString('en-IN') : '—';
      const row = [m.Maintenance_ID, m.Server_Name, md, m.Description||'—', `${m.Tech_First_Name} ${m.Tech_Last_Name}`, m.Maintenance_Status, m.Priority||'—'];
      const h = rowHeight(row, mW);
      if (y + h > 790) { doc.addPage(); y = 50; y = tableHeader(['ID','Server','Date','Description','Technician','Status','Pri'], mW, y); }
      y = tableRow(row, mW, y, i%2===0);
    });

    // SQL QUERIES SECTION
    y += 14;
    y = sectionHeader('5. SQL QUERIES — Key Database Operations', y);
    const queries_list = [
      { label:'Q1 — SELECT with WHERE (Available Servers)',
        sql:'SELECT Server_ID, Server_Name, CPU_Capacity, RAM_Capacity FROM SERVER\nWHERE Server_ID NOT IN (SELECT DISTINCT Server_ID FROM MAINTENANCE\n  WHERE Maintenance_Status = \'In Progress\');' },
      { label:'Q2 — JOIN (User + Allocation + Server)',
        sql:"SELECT U.User_ID, CONCAT(U.First_Name,' ',U.Last_Name) AS Full_Name, U.Role,\n       RA.Allocation_ID, S.Server_Name, RA.Allocation_Date\nFROM USER U\nJOIN RESOURCE_ALLOCATION RA ON U.User_ID = RA.User_ID\nJOIN SERVER S ON RA.Server_ID = S.Server_ID;" },
      { label:'Q3 — Aggregate (COUNT + AVG per Server)',
        sql:'SELECT S.Server_Name, COUNT(RA.Allocation_ID) AS Total_Allocations,\n       AVG(RA.Allocated_CPU) AS Avg_CPU, AVG(RA.Allocated_RAM) AS Avg_RAM\nFROM SERVER S LEFT JOIN RESOURCE_ALLOCATION RA ON S.Server_ID = RA.Server_ID\nGROUP BY S.Server_ID, S.Server_Name;' },
      { label:'Q4 — GROUP BY + HAVING (Heavy Users)',
        sql:'SELECT U.User_ID, CONCAT(U.First_Name,\' \',U.Last_Name) AS Name,\n       COUNT(RA.Allocation_ID) AS Total_Allocations\nFROM USER U JOIN RESOURCE_ALLOCATION RA ON U.User_ID = RA.User_ID\nGROUP BY U.User_ID HAVING COUNT(RA.Allocation_ID) > 1\nORDER BY Total_Allocations DESC;' },
      { label:'Q5 — ORDER BY (Maintenance Log)',
        sql:"SELECT M.Maintenance_ID, S.Server_Name, M.Maintenance_Date,\n       CONCAT(M.Tech_First_Name,' ',M.Tech_Last_Name) AS Technician,\n       M.Maintenance_Status\nFROM MAINTENANCE M JOIN SERVER S ON M.Server_ID = S.Server_ID\nORDER BY M.Maintenance_Date DESC;" },
    ];

    queries_list.forEach(q => {
      if (y > 700) { doc.addPage(); y = 50; }
      // Label
      drawRect(50, y, W, 18, '#eff6ff', 3);
      doc.font('Helvetica-Bold').fontSize(8.5).fillColor(BLUE).text(q.label, 56, y+5);
      y += 20;
      // SQL code box
      const lines = q.sql.split('\n');
      const boxH = lines.length * 12 + 10;
      drawRect(50, y, W, boxH, '#0f172a', 4);
      doc.font('Courier').fontSize(8).fillColor('#a5f3fc');
      lines.forEach((line, li) => {
        doc.text(line, 56, y + 5 + li*12, { width: W-12 });
      });
      y += boxH + 8;
    });

    // ══════════════════════════════════════════════
    // PAGE 4 — NORMALIZATION SUMMARY
    // ══════════════════════════════════════════════
    doc.addPage();
    y = 50;
    y = sectionHeader('6. NORMALIZATION SUMMARY', y);

    const normSteps = [
      { form:'UNF', desc:'Single flat table with all attributes. Contains multivalued Phone_No, composite attributes Name/Location/Technician_Name, derived attributes Status and Usage_Destination. 24 attributes total in one relation.', status:'❌ Violations Found' },
      { form:'1NF', desc:'Atomic values enforced. Phone_No separated into USER_PHONE table. Name decomposed → First_Name, Last_Name. Location → Data_Center, Rack_No. Technician_Name → Tech_First_Name, Tech_Last_Name. Derived attributes removed.', status:'✓ Achieved' },
      { form:'2NF', desc:'All partial dependencies removed. Decomposed into 5 tables: USER, USER_PHONE, SERVER, RESOURCE_ALLOCATION, MAINTENANCE. Each non-key attribute fully depends on its table primary key only.', status:'✓ Achieved' },
      { form:'3NF', desc:'Verified no transitive dependencies in all 5 tables. No non-key attribute depends on another non-key attribute. Schema remains unchanged from 2NF — all tables pass 3NF check.', status:'✓ Achieved' },
      { form:'BCNF', desc:'For every functional dependency X→Y in all tables, X is a superkey (primary key). All 5 tables verified. No further decomposition required.', status:'✓ Achieved' },
    ];

    normSteps.forEach((step, i) => {
      const isViolation = step.form === 'UNF';
      const bgColor = isViolation ? '#fef2f2' : (i===0?'#f0fdf4':'#f0fdf4');
      const borderColor = isViolation ? RED : GREEN;
      drawRect(50, y, W, 52, bgColor, 6);
      doc.save().roundedRect(50, y, W, 52, 6).strokeColor(borderColor).lineWidth(1).stroke().restore();
      drawRect(50, y, 60, 52, borderColor, 0);
      doc.save().roundedRect(50, y, W, 52, 6).clip().rect(50, y, 60, 52).fill(borderColor).restore();
      doc.font('Helvetica-Bold').fontSize(13).fillColor('white').text(step.form, 56, y+16);
      doc.font('Helvetica-Bold').fontSize(9).fillColor(borderColor).text(step.status, 120, y+6);
      doc.font('Helvetica').fontSize(8.5).fillColor(TEXT2).text(step.desc, 120, y+20, { width: W-80 });
      y += 60;
    });

    // FD Table
    y += 6;
    y = sectionHeader('7. FUNCTIONAL DEPENDENCIES', y);
    const fdW = [30, 200, 140, 125];
    y = tableHeader(['#','Functional Dependency','Table','Type'], fdW, y);
    const fds = [
      ['FD1','User_ID → First_Name, Last_Name, Role, Email, Department','USER','Full FD on PK'],
      ['FD2','(User_ID, Phone_No) → Phone_No','USER_PHONE','Full FD on composite PK'],
      ['FD3','Server_ID → Server_Name, CPU_Capacity, RAM_Capacity, Storage_Capacity, Data_Center, Rack_No','SERVER','Full FD on PK'],
      ['FD4','Allocation_ID → User_ID, Server_ID, Allocation_Date, Release_Date, Allocated_CPU, Allocated_RAM, Allocated_Storage','RESOURCE_ALLOCATION','Full FD on PK'],
      ['FD5','Maintenance_ID → Server_ID, Maint_Date, Description, Tech_First_Name, Tech_Last_Name, Maint_Status, Priority','MAINTENANCE','Full FD on PK'],
    ];
    fds.forEach((fd, i) => {
      const h = rowHeight(fd, fdW);
      if (y + h > 790) { doc.addPage(); y = 50; y = tableHeader(['#','Functional Dependency','Table','Type'], fdW, y); }
      y = tableRow(fd, fdW, y, i%2===0);
    });

    // ── FOOTER on every page ──────────────────────
    const pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(pages.start + i);
      // Keep footer inside printable area to avoid auto-created overflow pages
      drawRect(0, 770, 595, 22, DARKBG, 0);
      doc.font('Helvetica').fontSize(8).fillColor('#64748b')
         .text('Generated by SRMS System  |  VIT Chennai  |  BCSE302L  |  Sahil Poply & Vaibhav Dwivedi', 50, 777, { lineBreak: false });
      doc.font('Helvetica').fontSize(8).fillColor('#475569')
         .text(`Page ${i+1}`, 540, 777, { align: 'right', lineBreak: false });
    }

    doc.end();
  } catch(e) {
    console.error('PDF error:', e);
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: e.message });
    } else {
      res.end();
    }
  }
});

// ════════════════════════════════════════════════════════
//  AI CHATBOT — Natural Language to DB Actions
// ════════════════════════════════════════════════════════
app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ success: false, error: 'No message' });

  const msg = message.toLowerCase().trim();

  try {
    let response = { text: '', data: null, sql: '' };

    // ── Intent Detection & Response ──────────────────

    // Show all users
    if (/\b(show|list|get|display|all)\b.*\buser/i.test(message) || /\bwho.*user/i.test(message)) {
      const rows = await query('SELECT User_ID, First_Name, Last_Name, Email, Role FROM USER ORDER BY User_ID');
      response.sql = 'SELECT User_ID, First_Name, Last_Name, Email, Role FROM USER ORDER BY User_ID;';
      response.data = { type: 'table', columns: ['ID','Name','Email','Role'], rows: rows.map(u=>([u.User_ID, `${u.First_Name} ${u.Last_Name}`, u.Email, u.Role])) };
      response.text = `Found **${rows.length} users** in the system.`;
    }
    // Active servers
    else if (/active.*server|server.*active/i.test(message) || (/\bshow\b.*server/i.test(message) && !/maint/i.test(message))) {
      const rows = await query("SELECT Server_ID, Server_Name, CPU_Capacity, RAM_Capacity, Status FROM SERVER WHERE Status='Active'");
      response.sql = "SELECT * FROM SERVER WHERE Status = 'Active';";
      response.data = { type: 'table', columns: ['ID','Server','CPU','RAM (GB)','Status'], rows: rows.map(s=>([s.Server_ID, s.Server_Name, s.CPU_Capacity+'c', s.RAM_Capacity+'GB', s.Status])) };
      response.text = `**${rows.length} active servers** found and ready to use.`;
    }
    // All servers
    else if (/\bserver/i.test(message) && /\ball\b|list|show/i.test(message)) {
      const rows = await query('SELECT Server_ID, Server_Name, CPU_Capacity, RAM_Capacity, Status FROM SERVER');
      response.sql = 'SELECT * FROM SERVER;';
      response.data = { type: 'table', columns: ['ID','Server','CPU','RAM','Status'], rows: rows.map(s=>([s.Server_ID, s.Server_Name, s.CPU_Capacity, s.RAM_Capacity, s.Status])) };
      response.text = `All **${rows.length} servers** listed.`;
    }
    // Who is using server X
    else if (/who.*using|using.*server|allocat.*server|server.*allocat/i.test(message)) {
      const numMatch = message.match(/server\s*(\d+)|(\bAlpha|\bBeta|\bGamma|\bDelta|\bEpsilon)/i);
      let whereClause = '1=1';
      if (numMatch) {
        const n = numMatch[1];
        if (n) whereClause = `ra.Server_ID = ${parseInt(n)}`;
        else {
          const sname = numMatch[0].replace(/server\s*/i,'').trim();
          whereClause = `s.Server_Name LIKE '%${sname}%'`;
        }
      }
      const rows = await query(`SELECT CONCAT(u.First_Name,' ',u.Last_Name) AS User_Name, u.Role, s.Server_Name, ra.Allocation_Date, ra.Allocated_CPU, ra.Allocated_RAM FROM RESOURCE_ALLOCATION ra JOIN USER u ON ra.User_ID=u.User_ID JOIN SERVER s ON ra.Server_ID=s.Server_ID WHERE ra.Release_Date IS NULL AND ${whereClause}`);
      response.sql = `SELECT user+server FROM RESOURCE_ALLOCATION JOIN USER JOIN SERVER WHERE Release_Date IS NULL;`;
      response.data = { type: 'table', columns: ['User','Role','Server','Since','CPU','RAM'], rows: rows.map(r=>([r.User_Name, r.Role, r.Server_Name, r.Allocation_Date?.toLocaleDateString?.() || r.Allocation_Date || '—', r.Allocated_CPU+'c', r.Allocated_RAM+'GB'])) };
      response.text = rows.length ? `**${rows.length} active allocation(s)** found.` : 'No active allocations found for that server.';
    }
    // Maintenance
    else if (/mainten/i.test(message)) {
      const filter = /pending/i.test(message) ? "WHERE m.Maintenance_Status='Pending'" : /progress/i.test(message) ? "WHERE m.Maintenance_Status='In Progress'" : /complet/i.test(message) ? "WHERE m.Maintenance_Status='Completed'" : '';
      const rows = await query(`SELECT m.Maintenance_ID, s.Server_Name, m.Maintenance_Date, m.Tech_First_Name, m.Maintenance_Status, m.Priority FROM MAINTENANCE m JOIN SERVER s ON m.Server_ID=s.Server_ID ${filter} ORDER BY m.Maintenance_Date DESC`);
      response.sql = `SELECT * FROM MAINTENANCE ${filter} ORDER BY Maintenance_Date DESC;`;
      response.data = { type:'table', columns:['ID','Server','Date','Tech','Status','Priority'], rows: rows.map(m=>([m.Maintenance_ID, m.Server_Name, m.Maintenance_Date?.toLocaleDateString?.() || m.Maintenance_Date || '—', m.Tech_First_Name, m.Maintenance_Status, m.Priority||'—'])) };
      response.text = `**${rows.length} maintenance record(s)** ${filter?'(filtered)':'total'}.`;
    }
    // Count users / total users
    else if (/how many.*user|count.*user|total.*user/i.test(message)) {
      const [r] = await query('SELECT COUNT(*) AS cnt FROM USER');
      response.sql = 'SELECT COUNT(*) AS Total_Users FROM USER;';
      response.text = `There are currently **${r.cnt} users** registered in the system.`;
      response.data = { type:'stat', label:'Total Users', value: r.cnt };
    }
    // Count servers
    else if (/how many.*server|count.*server|total.*server/i.test(message)) {
      const [total] = await query('SELECT COUNT(*) AS cnt FROM SERVER');
      const [active] = await query("SELECT COUNT(*) AS cnt FROM SERVER WHERE Status='Active'");
      response.sql = 'SELECT COUNT(*) AS Total, SUM(Status="Active") AS Active FROM SERVER;';
      response.text = `There are **${total.cnt} servers** total, **${active.cnt} active**.`;
      response.data = { type:'stat', label:'Total Servers', value: `${active.cnt}/${total.cnt} Active` };
    }
    // Add new user intent
    else if (/add.*user|create.*user|new.*user|insert.*user/i.test(message)) {
      response.text = `To add a new user:\n1. Click **Users** in the sidebar\n2. Click **+ Add User** button\n3. Fill in: First Name, Last Name, Email, Role, Department, Phone\n4. Click **Save User**\n\nOr use SQL Runner with:\n\`\`\`\nINSERT INTO USER (First_Name, Last_Name, Email, Role) VALUES ('Name', 'Last', 'email@domain.com', 'Role');\n\`\`\``;
      response.sql = "INSERT INTO USER (First_Name, Last_Name, Email, Role) VALUES (?, ?, ?, ?);";
    }
    // Delete user intent
    else if (/delete.*user|remove.*user/i.test(message)) {
      response.text = `To delete a user:\n1. Go to **Users** panel\n2. Find the user in the table\n3. Click the **✕ Delete** button\n\nOr SQL: \`DELETE FROM USER WHERE User_ID = ?;\`\n\n⚠️ Warning: Deleting a user also removes all their allocations (CASCADE).`;
      response.sql = 'DELETE FROM USER WHERE User_ID = ?;';
    }
    // Allocations / resource usage
    else if (/allocation|allocated|resource.*usage/i.test(message)) {
      const rows = await query(`SELECT CONCAT(u.First_Name,' ',u.Last_Name) AS User_Name, s.Server_Name, ra.Allocated_CPU, ra.Allocated_RAM, ra.Allocated_Storage, ra.Allocation_Date FROM RESOURCE_ALLOCATION ra JOIN USER u ON ra.User_ID=u.User_ID JOIN SERVER s ON ra.Server_ID=s.Server_ID WHERE ra.Release_Date IS NULL`);
      response.sql = 'SELECT * FROM RESOURCE_ALLOCATION WHERE Release_Date IS NULL;';
      response.data = { type:'table', columns:['User','Server','CPU','RAM','Storage','Since'], rows: rows.map(r=>([r.User_Name, r.Server_Name, r.Allocated_CPU+'c', r.Allocated_RAM+'GB', r.Allocated_Storage+'GB', r.Allocation_Date?.toLocaleDateString?.() || r.Allocation_Date || '—'])) };
      response.text = `**${rows.length} active allocation(s)** currently running.`;
    }
    // CPU / RAM statistics
    else if (/cpu|ram|capacity|resource stat/i.test(message)) {
      const rows = await query('SELECT Server_Name, CPU_Capacity, RAM_Capacity, Storage_Capacity FROM SERVER');
      const totalCpu = rows.reduce((a,s)=>a+s.CPU_Capacity,0);
      const totalRam = rows.reduce((a,s)=>a+s.RAM_Capacity,0);
      response.sql = 'SELECT SUM(CPU_Capacity), SUM(RAM_Capacity) FROM SERVER;';
      response.data = { type:'table', columns:['Server','CPU (cores)','RAM (GB)','Storage (GB)'], rows: rows.map(s=>([s.Server_Name, s.CPU_Capacity, s.RAM_Capacity, s.Storage_Capacity])) };
      response.text = `Total infrastructure: **${totalCpu} CPU cores** and **${totalRam} GB RAM** across ${rows.length} servers.`;
    }
    // Heavy users / top users
    else if (/heavy user|top user|most.*allocation|who.*most/i.test(message)) {
      const rows = await query(`SELECT CONCAT(u.First_Name,' ',u.Last_Name) AS Name, u.Role, COUNT(ra.Allocation_ID) AS Total FROM USER u JOIN RESOURCE_ALLOCATION ra ON u.User_ID=ra.User_ID GROUP BY u.User_ID ORDER BY Total DESC LIMIT 5`);
      response.sql = 'SELECT user, COUNT(*) FROM RESOURCE_ALLOCATION GROUP BY User_ID ORDER BY COUNT(*) DESC;';
      response.data = { type:'table', columns:['User','Role','Total Allocations'], rows: rows.map(r=>([r.Name, r.Role, r.Total])) };
      response.text = `Top users by allocation count. **${rows[0]?.Name}** leads with **${rows[0]?.Total}** allocation(s).`;
    }
    // Help
    else if (/help|what can|command|what.*do|hi|hello/i.test(message)) {
      response.text = `Hi! I'm the SRMS Assistant 🤖 I can answer questions like:\n\n• **"Show all users"** — list all registered users\n• **"Show active servers"** — servers currently online\n• **"Who is using Server 1?"** — check active allocations\n• **"Show maintenance"** — view maintenance records\n• **"How many users?"** — quick count stats\n• **"Show allocations"** — active resource usage\n• **"Show CPU stats"** — infrastructure capacity\n• **"Who has most allocations?"** — top users\n• **"Add new user"** — guide to adding records\n\nJust type naturally!`;
    }
    // Unknown
    else {
      response.text = `I didn't quite understand that. Try asking:\n• "Show all users"\n• "Show active servers"\n• "Who is using Server 1?"\n• "Show pending maintenance"\n• "How many servers?"\n\nType **"help"** for all commands.`;
    }

    res.json({ success: true, ...response });
  } catch(e) {
    res.status(500).json({ success: false, error: e.message, text: 'Database error: ' + e.message });
  }
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
