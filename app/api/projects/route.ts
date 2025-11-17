import { NextRequest, NextResponse } from "next/server"
import mysql from "mysql2/promise"

// ------------------
// Database Config
// ------------------
const databaseConfig = {
  host: process.env.DB_HOST || "91.108.105.168",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "Saurabh@2000",
  database: process.env.DB_NAME || "ycis_datacenter",
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONN_LIMIT || 10),
  queueLimit: 0
}

// ------------------
// MySQL Pool
// ------------------
let pool: mysql.Pool | null = null

const getConnection = async (): Promise<mysql.Pool> => {
  if (!pool) {
    pool = mysql.createPool({
      host: databaseConfig.host,
      port: databaseConfig.port,
      user: databaseConfig.user,
      password: databaseConfig.password,
      database: databaseConfig.database,
      waitForConnections: databaseConfig.waitForConnections,
      connectionLimit: databaseConfig.connectionLimit,
      queueLimit: databaseConfig.queueLimit
    })
  }
  return pool
}

// ------------------
// Initialize Database
// ------------------
const initializeDatabase = async (): Promise<void> => {
  try {
    // Create DB if it doesn't exist
    const tempConnection = await mysql.createConnection({
      host: databaseConfig.host,
      port: databaseConfig.port,
      user: databaseConfig.user,
      password: databaseConfig.password
    })
    await tempConnection.execute(`CREATE DATABASE IF NOT EXISTS \`${databaseConfig.database}\``)
    await tempConnection.end()

    // Connect to DB and create table
    const connection = await getConnection()
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS projects (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        created_date DATE NOT NULL,
        renew_date DATE NOT NULL,
        client_email VARCHAR(255),
        client_pay BOOLEAN DEFAULT FALSE,
        amount DECIMAL(10,2) DEFAULT 0,
        status ENUM('Active', 'Inactive', 'Maintenance', 'Expired') DEFAULT 'Active',
        users INT DEFAULT 0,
        uptime VARCHAR(10) DEFAULT '99.9%',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_client_email (client_email)
      )
    `)
    
    // Add client_email column if it doesn't exist (migration for existing tables)
    try {
      await connection.execute(`
        ALTER TABLE projects 
        ADD COLUMN client_email VARCHAR(255) AFTER renew_date
      `)
      console.log('Added client_email column to projects table')
    } catch (error: any) {
      // Column already exists, ignore the error
      if (error.code !== 'ER_DUP_FIELDNAME') {
        console.error('Error adding client_email column:', error)
      }
    }
    
    // Add index if it doesn't exist
    try {
      await connection.execute(`
        ALTER TABLE projects 
        ADD INDEX idx_client_email (client_email)
      `)
    } catch (error: any) {
      // Index already exists, ignore
      if (error.code !== 'ER_DUP_KEYNAME') {
        console.error('Error adding index:', error)
      }
    }
    
    // Create junction table for project-clients many-to-many relationship
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS project_clients (
        id INT AUTO_INCREMENT PRIMARY KEY,
        project_id INT NOT NULL,
        client_email VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_project_client (project_id, client_email),
        INDEX idx_project_id (project_id),
        INDEX idx_client_email (client_email)
      )
    `)
    
    console.log("Database initialized successfully")
  } catch (error) {
    console.error("Failed to initialize database:", error)
    if (error instanceof Error) {
      console.error({
        message: error.message,
        code: (error as any).code,
        errno: (error as any).errno,
        sqlState: (error as any).sqlState
      })
    }
    throw error
  }
}

// ------------------
// Project Interface
// ------------------
interface Project {
  id?: number
  name: string
  category: string
  createdDate: string
  renewDate: string
  clientEmail?: string
  clientEmails?: string[] // Array of client emails for multiple clients
  clientPay: boolean
  amount: number
  status: "Active" | "Inactive" | "Maintenance" | "Expired"
  users?: number
  uptime?: string
  created_at?: string
  updated_at?: string
}

// ------------------
// GET /api/projects
// ------------------
export async function GET() {
  try {
    await initializeDatabase()
    const connection = await getConnection()

    const [rows] = await connection.execute("SELECT * FROM projects ORDER BY created_at DESC") as [any[], any]

    // Fetch client emails for each project from junction table
    const projects: Project[] = await Promise.all(rows.map(async (row) => {
      const [clientRows] = await connection.execute(
        "SELECT client_email FROM project_clients WHERE project_id = ?",
        [row.id]
      ) as [any[], any]
      
      const clientEmails = clientRows.map((r: any) => r.client_email)
      
      return {
        id: row.id,
        name: row.name,
        category: row.category,
        createdDate: row.created_date,
        renewDate: row.renew_date,
        clientEmail: row.client_email, // Keep for backward compatibility
        clientEmails: clientEmails.length > 0 ? clientEmails : (row.client_email ? [row.client_email] : []),
        clientPay: Boolean(row.client_pay),
        amount: parseFloat(row.amount),
        status: row.status,
        users: row.users || 0,
        uptime: row.uptime || "99.9%",
        created_at: row.created_at,
        updated_at: row.updated_at
      }
    }))

    return NextResponse.json({ success: true, projects })
  } catch (error) {
    console.error("Error fetching projects:", error)
    const errorMessage = error instanceof Error ? error.message : "Database connection failed"
    const errorCode = (error as any)?.code || "UNKNOWN"
    
    console.error("Database error details:", {
      message: errorMessage,
      code: errorCode,
      errno: (error as any)?.errno,
      host: databaseConfig.host,
      database: databaseConfig.database
    })
    
    return NextResponse.json({ 
      success: false, 
      error: `Database error: ${errorMessage} (Code: ${errorCode})`,
      details: "Check server console for more information"
    }, { status: 500 })
  }
}

// ------------------
// POST /api/projects
// ------------------
export async function POST(request: NextRequest) {
  try {
    await initializeDatabase()
    const body = await request.json()

    const { name, category, createdDate, renewDate, clientEmail, clientEmails, clientPay, amount, status, users, uptime } = body

    if (!name || !category || !createdDate || !renewDate) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    const formatDate = (dateString: string) => {
      const date = new Date(dateString)
      return date.toISOString().split("T")[0]
    }

    const connection = await getConnection()
    
    // Determine which client emails to use (prefer clientEmails array, fallback to clientEmail)
    const emailsToAssign = clientEmails && Array.isArray(clientEmails) && clientEmails.length > 0 
      ? clientEmails.filter((email: string) => email && email.trim() !== '')
      : (clientEmail && clientEmail.trim() !== '' ? [clientEmail] : [])
    
    // Use first email for backward compatibility with client_email column
    const primaryClientEmail = emailsToAssign.length > 0 ? emailsToAssign[0] : null
    
    const result = await connection.execute(
      `INSERT INTO projects (name, category, created_date, renew_date, client_email, client_pay, amount, status, users, uptime)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        category,
        formatDate(createdDate),
        formatDate(renewDate),
        primaryClientEmail,
        clientPay || false,
        amount || 0,
        status || "Active",
        users || 0,
        uptime || "99.9%"
      ]
    ) as any

    const projectId = result[0].insertId

    // Insert into junction table for all client emails
    if (emailsToAssign.length > 0) {
      const insertPromises = emailsToAssign.map((email: string) =>
        connection.execute(
          "INSERT INTO project_clients (project_id, client_email) VALUES (?, ?)",
          [projectId, email]
        ).catch((err: any) => {
          // Ignore duplicate key errors
          if (err.code !== 'ER_DUP_ENTRY') {
            console.error(`Error inserting client email ${email}:`, err)
          }
        })
      )
      await Promise.all(insertPromises)
    }

    return NextResponse.json({
      success: true,
      projectId: projectId,
      message: "Project created successfully"
    })
  } catch (error) {
    console.error("Error creating project:", error)
    return NextResponse.json({ success: false, error: "Failed to create project" }, { status: 500 })
  }
}
