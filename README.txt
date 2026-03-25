╔══════════════════════════════════════════════════════════════════╗
║      SRMS — Server Resource Management System                    ║
║      VIT Chennai · BCSE302L · DA3                                ║
║      Team: Sahil Poply (24BDS1135) · Vaibhav Dwivedi (24BDS1164)║
╚══════════════════════════════════════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  YOUR PROJECT FOLDER CONTAINS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  setup.sql      ← Run this in MySQL Workbench first
  server.js      ← Node.js backend (connects to MySQL)
  index.html     ← Frontend web application
  package.json   ← Node.js dependencies list
  README.txt     ← This file

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  STEP 1 — INSTALL MYSQL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  1. Go to: https://dev.mysql.com/downloads/mysql/
  2. Download "MySQL Community Server" for your OS
  3. During installation:
     → Set root password to:  root123
        (or anything you remember — you'll put it in server.js)
     → Select "Developer Default" setup type
  4. Also install "MySQL Workbench" (comes with installer)
  5. After install, open MySQL Workbench to verify it works

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  STEP 2 — SET UP THE DATABASE (MySQL Workbench)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  1. Open MySQL Workbench
  2. Click on "Local instance MySQL" (or your connection)
  3. Enter your root password
  4. Click File → Open SQL Script
  5. Browse to this folder and select:  setup.sql
  6. Click the ⚡ Execute button (or press Ctrl+Shift+Enter)
  7. You should see in the output:
     ┌────────────────────────────┬─────────┐
     │ TableName                  │ Records │
     ├────────────────────────────┼─────────┤
     │ USER                       │ 5       │
     │ USER_PHONE                 │ 5       │
     │ SERVER                     │ 5       │
     │ RESOURCE_ALLOCATION        │ 6       │
     │ MAINTENANCE                │ 5       │
     └────────────────────────────┴─────────┘
  ✅ Database is ready!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  STEP 3 — INSTALL NODE.JS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  1. Go to: https://nodejs.org
  2. Download the LTS version (Long Term Support)
  3. Install it (just keep clicking Next)
  4. Verify it works — open Command Prompt and type:
       node --version
     You should see something like: v20.x.x

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  STEP 4 — SET YOUR MYSQL PASSWORD IN server.js
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  1. Open server.js in any text editor (Notepad, VS Code, etc.)
  2. Find this section (around line 20):
       const db = mysql.createConnection({
         host    : 'localhost',
         user    : 'root',
         password: 'root123',    ← CHANGE THIS
         database: 'srms_db'
       });
  3. Replace 'root123' with your actual MySQL root password
  4. Save the file

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  STEP 5 — INSTALL NODE PACKAGES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  1. Open Command Prompt (or Terminal)
  2. Navigate to this project folder:
       cd C:\Users\YourName\Desktop\srms_project
       (adjust the path to where your folder is)
  3. Run this command:
       npm install
  4. Wait for it to finish — it downloads express, mysql2, cors
  5. You'll see a  node_modules  folder appear ✅

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  STEP 6 — START THE BACKEND SERVER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  In the same Command Prompt, run:
    node server.js

  You should see:
  ╔══════════════════════════════════════════╗
  ║   SRMS Backend Server — RUNNING          ║
  ║   URL: http://localhost:3000             ║
  ║   Database: srms_db (MySQL)             ║
  ╚══════════════════════════════════════════╝
  ✅ Connected to MySQL — srms_db

  ⚠️ Keep this terminal window OPEN while using the app.
     If you close it, the app stops working.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  STEP 7 — OPEN THE APP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Open Google Chrome and go to:
    http://localhost:3000

  OR just double-click  index.html  
  (but http://localhost:3000 is better — shows "MySQL Connected")

  You should see the green dot: ● MySQL Connected

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  WHAT EACH ACTION DOES TO MYSQL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ┌──────────────────────────────┬───────────────────────────────────────┐
  │ Action in App                │ SQL that runs on MySQL                │
  ├──────────────────────────────┼───────────────────────────────────────┤
  │ App loads → shows users      │ SELECT * FROM USER                    │
  │ App loads → shows servers    │ SELECT * FROM SERVER                  │
  │ Click "Add User"             │ INSERT INTO USER VALUES (...)         │
  │ Click "Edit User" → Save     │ UPDATE USER SET ... WHERE User_ID=?   │
  │ Click ✕ Delete User          │ DELETE FROM USER WHERE User_ID=?      │
  │ Add Maintenance (In Progress)│ INSERT + UPDATE SERVER SET Status=... │
  │ Click ✓ Done on maintenance  │ UPDATE MAINTENANCE SET Status=...     │
  │                              │ + UPDATE SERVER SET Status='Active'   │
  │ SQL Runner → any query       │ Runs directly on MySQL — real results │
  │ Resource Calculator          │ SELECT active allocations from MySQL  │
  │ Dashboard charts             │ COUNT, GROUP BY queries on MySQL      │
  └──────────────────────────────┴───────────────────────────────────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  TROUBLESHOOTING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Problem: "Cannot reach server"
  → Make sure you ran: node server.js in the terminal
  → Make sure terminal is still open (don't close it)

  Problem: "MySQL connection failed"
  → Check your password in server.js is correct
  → Make sure MySQL service is running:
    Windows: Open "Services" app → find "MySQL80" → Start it

  Problem: "npm is not recognized"
  → Node.js not installed properly → reinstall from nodejs.org

  Problem: port already in use
  → Change PORT = 3000 to PORT = 3001 in server.js
  → Then open: http://localhost:3001

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  FOR THE DA3 DEMO — WHAT TO SHOW
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  1. Show setup.sql in MySQL Workbench  → database creation
  2. Show tables in MySQL Workbench     → table structure
  3. Open the app                       → show MySQL Connected dot
  4. Add a new user from the app        → check MySQL Workbench, row appears!
  5. Run Q2 (JOIN) in SQL Runner        → show real query on real DB
  6. Run Q6 (UPDATE) in SQL Runner      → show row changes in Workbench
  7. Run Q8 (ALTER TABLE) in SQL Runner → show column added in Workbench
  8. Use Resource Calculator            → explain live data from DB
  9. Delete a record                    → show it disappears from DB

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
