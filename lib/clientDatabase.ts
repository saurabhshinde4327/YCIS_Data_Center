// Client Database Management with MySQL Persistence
import mysql from 'mysql2/promise'

export interface Client {
  id: string
  name: string
  email: string
  password: string
  phone?: string
  company?: string
  package?: string
  status: 'active' | 'inactive' | 'suspended'
  projectStatus?: 'planning' | 'in-progress' | 'deployed' | 'maintenance' | 'completed'
  renewalDate?: string
  createdAt: string
  updatedAt: string
}

// MySQL configuration (same host as projects API)
const databaseConfig = {
  host: process.env.DB_HOST || '91.108.105.168',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Saurabh@2000',
  database: process.env.DB_NAME || 'ycis_datacenter',
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONN_LIMIT || 10),
  queueLimit: 0
}

let pool: mysql.Pool | null = null

const getPool = async (): Promise<mysql.Pool> => {
  if (!pool) {
    pool = mysql.createPool(databaseConfig)
  }
  return pool
}

const initializeClientTables = async () => {
  const pool = await getPool()
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS clients (
      id BIGINT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      phone VARCHAR(50),
      company VARCHAR(255),
      package VARCHAR(255),
      status ENUM('active','inactive','suspended') DEFAULT 'active',
      project_status ENUM('planning','in-progress','deployed','maintenance','completed') DEFAULT 'planning',
      renewal_date DATE NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_email (email)
    )
  `)
}

export const clientDB = {
  // Get all clients (without password for public use)
  async getAllClients(): Promise<Omit<Client, 'password'>[]> {
    await initializeClientTables()
    const pool = await getPool()
    const [rows] = await pool.query(`SELECT id, name, email, phone, company, package, status, project_status AS projectStatus, renewal_date AS renewalDate, created_at AS createdAt, updated_at AS updatedAt FROM clients ORDER BY created_at DESC`)
    return (rows as any[]).map(r => ({
      id: String(r.id),
      name: r.name,
      email: r.email,
      phone: r.phone || undefined,
      company: r.company || undefined,
      package: r.package || undefined,
      status: r.status,
      projectStatus: r.projectStatus || undefined,
      renewalDate: r.renewalDate || undefined,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt
    }))
  },

  // Get all clients with passwords (for admin panel only)
  async getAllClientsWithPassword(): Promise<Client[]> {
    await initializeClientTables()
    const pool = await getPool()
    const [rows] = await pool.query(`SELECT id, name, email, password, phone, company, package, status, project_status AS projectStatus, renewal_date AS renewalDate, created_at AS createdAt, updated_at AS updatedAt FROM clients ORDER BY created_at DESC`)
    return (rows as any[]).map(r => ({
      id: String(r.id),
      name: r.name,
      email: r.email,
      password: r.password,
      phone: r.phone || undefined,
      company: r.company || undefined,
      package: r.package || undefined,
      status: r.status,
      projectStatus: r.projectStatus || undefined,
      renewalDate: r.renewalDate || undefined,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt
    }))
  },

  // Get client by ID
  async getClient(id: string): Promise<Omit<Client, 'password'> | null> {
    await initializeClientTables()
    const pool = await getPool()
    const [rows] = await pool.query(`SELECT id, name, email, phone, company, package, status, project_status AS projectStatus, renewal_date AS renewalDate, created_at AS createdAt, updated_at AS updatedAt FROM clients WHERE id = ? LIMIT 1`, [id])
    const r = (rows as any[])[0]
    if (!r) return null
    return {
      id: String(r.id),
      name: r.name,
      email: r.email,
      phone: r.phone || undefined,
      company: r.company || undefined,
      package: r.package || undefined,
      status: r.status,
      projectStatus: r.projectStatus || undefined,
      renewalDate: r.renewalDate || undefined,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt
    }
  },

  // Get client by ID with password (for password verification)
  async getClientByIdWithPassword(id: string): Promise<Client | null> {
    await initializeClientTables()
    const pool = await getPool()
    const [rows] = await pool.query(`SELECT id, name, email, password, phone, company, package, status, project_status AS projectStatus, renewal_date AS renewalDate, created_at AS createdAt, updated_at AS updatedAt FROM clients WHERE id = ? LIMIT 1`, [id])
    const r = (rows as any[])[0]
    if (!r) return null
    return {
      id: String(r.id),
      name: r.name,
      email: r.email,
      password: r.password,
      phone: r.phone || undefined,
      company: r.company || undefined,
      package: r.package || undefined,
      status: r.status,
      projectStatus: r.projectStatus || undefined,
      renewalDate: r.renewalDate || undefined,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt
    }
  },

  // Get client by email (for authentication)
  async getClientByEmail(email: string): Promise<Client | null> {
    await initializeClientTables()
    const pool = await getPool()
    const [rows] = await pool.query(`SELECT id, name, email, password, phone, company, package, status, project_status AS projectStatus, renewal_date AS renewalDate, created_at AS createdAt, updated_at AS updatedAt FROM clients WHERE LOWER(email) = LOWER(?) LIMIT 1`, [email])
    const r = (rows as any[])[0]
    if (!r) return null
    return {
      id: String(r.id),
      name: r.name,
      email: r.email,
      password: r.password,
      phone: r.phone || undefined,
      company: r.company || undefined,
      package: r.package || undefined,
      status: r.status,
      projectStatus: r.projectStatus || undefined,
      renewalDate: r.renewalDate || undefined,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt
    }
  },

  // Create new client
  async createClient(client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<Omit<Client, 'password'>> {
    await initializeClientTables()
    const pool = await getPool()
    const id = Math.floor(Date.now() / 1000) + Math.floor(Math.random() * 100000)
    const createdAt = new Date()
    await pool.execute(
      `INSERT INTO clients (id, name, email, password, phone, company, package, status, project_status, renewal_date, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        client.name,
        client.email,
        client.password,
        client.phone || null,
        client.company || null,
        client.package || null,
        client.status || 'active',
        client.projectStatus || 'planning',
        client.renewalDate || null,
        createdAt,
        createdAt
      ]
    )
    return {
      id: String(id),
      name: client.name,
      email: client.email,
      phone: client.phone,
      company: client.company,
      package: client.package,
      status: client.status || 'active',
      projectStatus: client.projectStatus || 'planning',
      renewalDate: client.renewalDate,
      createdAt: createdAt.toISOString(),
      updatedAt: createdAt.toISOString()
    }
  },

  // Update client
  async updateClient(id: string, updates: Partial<Client>): Promise<Omit<Client, 'password'> | null> {
    await initializeClientTables()
    const pool = await getPool()
    // Build dynamic SET clause
    const fields: string[] = []
    const values: any[] = []
    const map: Record<string, string> = {
      name: 'name',
      email: 'email',
      password: 'password',
      phone: 'phone',
      company: 'company',
      package: 'package',
      status: 'status',
      projectStatus: 'project_status',
      renewalDate: 'renewal_date'
    }
    Object.entries(updates).forEach(([k, v]) => {
      if (v === undefined) return
      const col = map[k]
      if (col) {
        fields.push(`${col} = ?`)
        values.push(v)
      }
    })
    if (fields.length === 0) {
      // Nothing to update
      return await this.getClient(id)
    }
    values.push(id)
    await pool.execute(`UPDATE clients SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, values)
    return await this.getClient(id)
  },

  // Delete client
  async deleteClient(id: string): Promise<boolean> {
    await initializeClientTables()
    const pool = await getPool()
    const [result] = await pool.execute(`DELETE FROM clients WHERE id = ?`, [id])
    // @ts-ignore
    return result.affectedRows > 0
  }
}

// Initialize client database (ensure tables exist)
export const initializeClientDatabase = async () => {
  await initializeClientTables()
}

// Auto-initialize (fire and forget)
initializeClientDatabase().catch(err => console.error('Client DB init failed:', err))

