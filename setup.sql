-- ============================================================
--  SRMS — Server Resource Management System
--  STEP 1: Run this entire file in MySQL Workbench
--  File: setup.sql
-- ============================================================

-- ── CREATE DATABASE ──────────────────────────────────────
DROP DATABASE IF EXISTS srms_db;
CREATE DATABASE srms_db;
USE srms_db;

-- ── TABLE 1: USER ────────────────────────────────────────
CREATE TABLE USER (
    User_ID    INT          AUTO_INCREMENT PRIMARY KEY,
    First_Name VARCHAR(50)  NOT NULL,
    Last_Name  VARCHAR(50)  NOT NULL,
    Email      VARCHAR(100) NOT NULL UNIQUE,
    Role       VARCHAR(50)  NOT NULL,
    Created_At TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- ── TABLE 2: USER_PHONE (Multivalued Attribute) ──────────
CREATE TABLE USER_PHONE (
    User_ID  INT         NOT NULL,
    Phone_No VARCHAR(15) NOT NULL,
    PRIMARY KEY (User_ID, Phone_No),
    FOREIGN KEY (User_ID) REFERENCES USER(User_ID)
        ON DELETE CASCADE
);

-- ── TABLE 3: SERVER ──────────────────────────────────────
CREATE TABLE SERVER (
    Server_ID        INT          AUTO_INCREMENT PRIMARY KEY,
    Server_Name      VARCHAR(100) NOT NULL,
    CPU_Capacity     INT          NOT NULL,
    RAM_Capacity     INT          NOT NULL,
    Storage_Capacity INT          NOT NULL,
    Data_Center      VARCHAR(100) NOT NULL,
    Rack_No          VARCHAR(20)  NOT NULL,
    Status           VARCHAR(30)  NOT NULL DEFAULT 'Active',
    Created_At       TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- ── TABLE 4: RESOURCE_ALLOCATION ─────────────────────────
CREATE TABLE RESOURCE_ALLOCATION (
    Allocation_ID     INT  AUTO_INCREMENT PRIMARY KEY,
    User_ID           INT  NOT NULL,
    Server_ID         INT  NOT NULL,
    Allocation_Date   DATE NOT NULL,
    Release_Date      DATE DEFAULT NULL,
    Allocated_CPU     INT  NOT NULL,
    Allocated_RAM     INT  NOT NULL,
    Allocated_Storage INT  NOT NULL,
    Created_At        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (User_ID)   REFERENCES USER(User_ID)   ON DELETE CASCADE,
    FOREIGN KEY (Server_ID) REFERENCES SERVER(Server_ID) ON DELETE CASCADE
);

-- ── TABLE 5: MAINTENANCE ─────────────────────────────────
CREATE TABLE MAINTENANCE (
    Maintenance_ID     INT          AUTO_INCREMENT PRIMARY KEY,
    Server_ID          INT          NOT NULL,
    Maintenance_Date   DATE         NOT NULL,
    Description        TEXT,
    Tech_First_Name    VARCHAR(50)  NOT NULL,
    Tech_Last_Name     VARCHAR(50)  NOT NULL,
    Maintenance_Status VARCHAR(30)  NOT NULL DEFAULT 'Pending',
    Created_At         TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Server_ID) REFERENCES SERVER(Server_ID) ON DELETE CASCADE
);

-- ── ALTER TABLE EXAMPLES ─────────────────────────────────
-- Adding a Department column to USER
ALTER TABLE USER ADD COLUMN Department VARCHAR(100) DEFAULT 'General';

-- Adding Priority column to MAINTENANCE
ALTER TABLE MAINTENANCE ADD COLUMN Priority VARCHAR(20) DEFAULT 'Medium';

-- ── INSERT DATA: USER ────────────────────────────────────
INSERT INTO USER (First_Name, Last_Name, Email, Role, Department) VALUES
('Sahil',   'Poply',   'sahil.poply@email.com',    'Developer',            'Engineering'),
('Vaibhav', 'Dwivedi', 'vaibhav.dwivedi@email.com','Admin',                'IT Operations'),
('Aryan',   'Sharma',  'aryan.sharma@email.com',   'Data Analyst',         'Data Science'),
('Priya',   'Mehta',   'priya.mehta@email.com',    'DevOps Engineer',      'Infrastructure'),
('Ravi',    'Kumar',   'ravi.kumar@email.com',     'System Administrator', 'IT Operations');

-- ── INSERT DATA: USER_PHONE ──────────────────────────────
INSERT INTO USER_PHONE VALUES
(1, '9876543210'),
(2, '9123456789'),
(3, '9012345678'),
(4, '9988776655'),
(5, '9911223344');

-- ── INSERT DATA: SERVER ──────────────────────────────────
INSERT INTO SERVER (Server_Name, CPU_Capacity, RAM_Capacity, Storage_Capacity, Data_Center, Rack_No, Status) VALUES
('Alpha-01',    32,  128,  2000,  'DC-Chennai',   'R-01', 'Active'),
('Beta-02',     16,  64,   1000,  'DC-Mumbai',    'R-04', 'Active'),
('Gamma-03',    64,  256,  5000,  'DC-Delhi',     'R-07', 'Under Maintenance'),
('Delta-04',    8,   32,   500,   'DC-Hyderabad', 'R-02', 'Active'),
('Epsilon-05',  128, 512,  10000, 'DC-Bangalore', 'R-12', 'Active');

-- ── INSERT DATA: RESOURCE_ALLOCATION ────────────────────
INSERT INTO RESOURCE_ALLOCATION (User_ID, Server_ID, Allocation_Date, Release_Date, Allocated_CPU, Allocated_RAM, Allocated_Storage) VALUES
(1, 1, '2025-01-10', '2025-03-10',  8,  32,  500),
(2, 2, '2025-02-01', NULL,          4,  16,  250),
(3, 5, '2025-01-15', '2025-02-15', 16,  64,  1000),
(4, 1, '2025-03-01', NULL,          8,  16,  200),
(5, 4, '2025-02-20', '2025-03-20',  4,  8,   100),
(1, 3, '2025-03-05', NULL,         32, 128,  2000);

-- ── INSERT DATA: MAINTENANCE ─────────────────────────────
INSERT INTO MAINTENANCE (Server_ID, Maintenance_Date, Description, Tech_First_Name, Tech_Last_Name, Maintenance_Status, Priority) VALUES
(3, '2025-03-05', 'Scheduled hardware upgrade',   'Rohit',  'Verma', 'In Progress', 'High'),
(1, '2025-01-20', 'SSD replacement',              'Ankit',  'Singh', 'Completed',   'Medium'),
(2, '2025-02-10', 'Network interface card repair','Sunita', 'Rao',   'Completed',   'Medium'),
(5, '2025-03-12', 'OS patch update',              'Kiran',  'Joshi', 'Pending',     'Low'),
(4, '2025-01-05', 'RAM module replacement',       'Deepak', 'Nair',  'Completed',   'High');

-- ── VERIFY: Check all tables ─────────────────────────────
SELECT 'USER'                AS TableName, COUNT(*) AS Records FROM USER
UNION ALL
SELECT 'USER_PHONE',                       COUNT(*) FROM USER_PHONE
UNION ALL
SELECT 'SERVER',                           COUNT(*) FROM SERVER
UNION ALL
SELECT 'RESOURCE_ALLOCATION',              COUNT(*) FROM RESOURCE_ALLOCATION
UNION ALL
SELECT 'MAINTENANCE',                      COUNT(*) FROM MAINTENANCE;
