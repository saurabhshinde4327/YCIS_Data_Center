import { NextRequest, NextResponse } from "next/server"
import mysql from "mysql2/promise"

const databaseConfig = {
  host: process.env.DB_HOST || "91.108.105.168",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "Saurabh@2000",
  database: process.env.DB_NAME || "ycis_datacenter",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
}

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

const initializeDatabase = async (): Promise<void> => {
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
}

// PUT update project
export async function PUT(
  request: NextRequest, 
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    await initializeDatabase()
    const body = await request.json()
    
    // Handle both Promise and direct params for compatibility
    const params = await Promise.resolve(context.params)
    const projectId = parseInt(params.id)
    
    if (isNaN(projectId)) {
      return NextResponse.json({ success: false, error: "Invalid project ID" }, { status: 400 })
    }

    const { name, category, createdDate, renewDate, clientEmail, clientEmails, clientPay, amount, status, users, uptime } = body
    
    // For partial updates (like toggling clientPay), fetch existing project first
    const connection = await getConnection()
    
    // Determine which client emails to use (prefer clientEmails array, fallback to clientEmail)
    const emailsToAssign = clientEmails && Array.isArray(clientEmails) && clientEmails.length > 0 
      ? clientEmails.filter((email: string) => email && email.trim() !== '')
      : (clientEmail && clientEmail.trim() !== '' ? [clientEmail] : [])
    
    // Use first email for backward compatibility with client_email column
    const primaryClientEmail = emailsToAssign.length > 0 ? emailsToAssign[0] : null
    
    // If this is a partial update, we need to get the existing values
    if (!name || !category || !createdDate || !renewDate) {
      const [existing] = await connection.execute(
        "SELECT * FROM projects WHERE id=?", 
        [projectId]
      ) as any
      
      if (!existing || existing.length === 0) {
        return NextResponse.json({ success: false, error: "Project not found" }, { status: 404 })
      }
      
      const existingProject = existing[0]
      
      // Use existing values for missing fields
      const updateData = {
        name: name || existingProject.name,
        category: category || existingProject.category,
        createdDate: createdDate || existingProject.created_date,
        renewDate: renewDate || existingProject.renew_date,
        clientEmail: clientEmail !== undefined ? (clientEmail && clientEmail !== '' ? clientEmail : null) : existingProject.client_email,
        clientPay: clientPay !== undefined ? clientPay : Boolean(existingProject.client_pay),
        amount: amount !== undefined ? amount : parseFloat(existingProject.amount),
        status: status || existingProject.status,
        users: users !== undefined ? users : existingProject.users,
        uptime: uptime || existingProject.uptime
      }
      
      // If clientEmails is provided, use it; otherwise keep existing
      const finalEmails = emailsToAssign.length > 0 ? emailsToAssign : 
        (clientEmail !== undefined ? (clientEmail && clientEmail !== '' ? [clientEmail] : []) : null)
      
      const formatDate = (date: string | Date) => {
        if (date instanceof Date) return date.toISOString().split("T")[0]
        const d = new Date(date)
        return d.toISOString().split("T")[0]
      }
      
      const finalPrimaryEmail = finalEmails && finalEmails.length > 0 ? finalEmails[0] : updateData.clientEmail
      
      const result = await connection.execute(
        `UPDATE projects SET name=?, category=?, created_date=?, renew_date=?, client_email=?, client_pay=?, amount=?, status=?, users=?, uptime=? WHERE id=?`,
        [
          updateData.name,
          updateData.category,
          formatDate(updateData.createdDate),
          formatDate(updateData.renewDate),
          finalPrimaryEmail,
          updateData.clientPay,
          updateData.amount,
          updateData.status,
          updateData.users,
          updateData.uptime,
          projectId
        ]
      ) as any

      if (result[0].affectedRows === 0) {
        return NextResponse.json({ success: false, error: "Failed to update project" }, { status: 500 })
      }

      // Update junction table if clientEmails is provided
      if (finalEmails !== null) {
        // Delete existing relationships
        await connection.execute("DELETE FROM project_clients WHERE project_id = ?", [projectId])
        
        // Insert new relationships
        if (finalEmails.length > 0) {
          const insertPromises = finalEmails.map((email: string) =>
            connection.execute(
              "INSERT INTO project_clients (project_id, client_email) VALUES (?, ?)",
              [projectId, email]
            ).catch((err: any) => {
              if (err.code !== 'ER_DUP_ENTRY') {
                console.error(`Error inserting client email ${email}:`, err)
              }
            })
          )
          await Promise.all(insertPromises)
        }
      }

      return NextResponse.json({ success: true, message: "Project updated successfully" })
    }
    
    // Full update with all required fields
    const formatDate = (date: string) => new Date(date).toISOString().split("T")[0]

    const result = await connection.execute(
      `UPDATE projects SET name=?, category=?, created_date=?, renew_date=?, client_email=?, client_pay=?, amount=?, status=?, users=?, uptime=? WHERE id=?`,
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
        uptime || "99.9%", 
        projectId
      ]
    ) as any

    if (result[0].affectedRows === 0) {
      return NextResponse.json({ success: false, error: "Project not found" }, { status: 404 })
    }

    // Update junction table
    // Delete existing relationships
    await connection.execute("DELETE FROM project_clients WHERE project_id = ?", [projectId])
    
    // Insert new relationships
    if (emailsToAssign.length > 0) {
      const insertPromises = emailsToAssign.map((email: string) =>
        connection.execute(
          "INSERT INTO project_clients (project_id, client_email) VALUES (?, ?)",
          [projectId, email]
        ).catch((err: any) => {
          if (err.code !== 'ER_DUP_ENTRY') {
            console.error(`Error inserting client email ${email}:`, err)
          }
        })
      )
      await Promise.all(insertPromises)
    }

    return NextResponse.json({ success: true, message: "Project updated successfully" })
  } catch (error: any) {
    console.error("Error updating project:", error)
    
    // Check for specific MySQL permission error
    if (error.code === 'ER_TABLEACCESS_DENIED_ERROR' || error.message?.includes('Access denied')) {
      return NextResponse.json({ 
        success: false, 
        error: "Database permission error. Please contact your database administrator to grant UPDATE privileges to the database user."
      }, { status: 403 })
    }
    
    const errorMessage = error instanceof Error ? error.message : "Failed to update project"
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 })
  }
}

// DELETE project
export async function DELETE(
  request: NextRequest, 
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    await initializeDatabase()
    
    // Handle both Promise and direct params for compatibility
    const params = await Promise.resolve(context.params)
    const projectId = parseInt(params.id)
    
    if (isNaN(projectId)) {
      return NextResponse.json({ success: false, error: "Invalid project ID" }, { status: 400 })
    }

    const connection = await getConnection()
    const result = await connection.execute("DELETE FROM projects WHERE id=?", [projectId]) as any

    if (result[0].affectedRows === 0) {
      return NextResponse.json({ success: false, error: "Project not found" }, { status: 404 })
    }
    
    return NextResponse.json({ success: true, message: "Project deleted successfully" })
  } catch (error: any) {
    console.error("Error deleting project:", error)
    
    // Check for specific MySQL permission error
    if (error.code === 'ER_TABLEACCESS_DENIED_ERROR' || error.message?.includes('Access denied')) {
      return NextResponse.json({ 
        success: false, 
        error: "Database permission error. Please contact your database administrator to grant DELETE privileges to the database user.",
        details: "The MySQL user needs DELETE permission on the projects table. Run: GRANT DELETE ON ycis_datacenter.projects TO 'root'@'%'; FLUSH PRIVILEGES;"
      }, { status: 403 })
    }
    
    const errorMessage = error instanceof Error ? error.message : "Failed to delete project"
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 })
  }
}
