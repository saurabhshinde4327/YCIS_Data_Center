import mysql from 'mysql2/promise'

export interface AdminUser {
  id: string
  email: string
  password: string
  name: string
  role: 'admin'
  createdAt: string
}

const adminDbConfig = {
  host: process.env.DB_HOST || '91.108.105.168',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Saurabh@2000',
  database: process.env.DB_NAME || 'ycis_datacenter',
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONN_LIMIT || 10),
  queueLimit: 0
}

let adminPool: mysql.Pool | null = null

const getAdminPool = async (): Promise<mysql.Pool> => {
  if (!adminPool) {
    adminPool = mysql.createPool(adminDbConfig)
  }
  return adminPool
}

const ensureAdminTable = async () => {
  const pool = await getAdminPool()
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS admins (
      id BIGINT PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      role ENUM('admin') DEFAULT 'admin',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `)
}

const maybeSeedDefaultAdmin = async () => {
  const pool = await getAdminPool()
  const email = process.env.ADMIN_EMAIL || 'shindesaurabh0321@gmail.com'
  const password = process.env.ADMIN_PASSWORD || 'Saurabh@2000'
  const name = process.env.ADMIN_NAME || 'Administrator'

  // Check if admin already exists with this email
  const [existing] = await pool.query(
    `SELECT id FROM admins WHERE LOWER(email) = LOWER(?) LIMIT 1`,
    [email]
  )
  if ((existing as any[])[0]) return

  const id = Math.floor(Date.now() / 1000) + Math.floor(Math.random() * 100000)

  try {
    await pool.execute(
      `INSERT INTO admins (id, email, password, name, role) VALUES (?, ?, ?, ?, 'admin')`,
      [id, email, password, name]
    )
  } catch (err: any) {
    // Ignore duplicate inserts triggered by concurrent init
    if (err?.code !== 'ER_DUP_ENTRY') {
      throw err
    }
  }
}

export const adminDb = {
  async getAdminByEmail(email: string): Promise<AdminUser | null> {
    await ensureAdminTable()
    await maybeSeedDefaultAdmin()
    const pool = await getAdminPool()
    const [rows] = await pool.query(
      `SELECT id, email, password, name, role, created_at AS createdAt FROM admins WHERE LOWER(email) = LOWER(?) LIMIT 1`,
      [email]
    )
    const admin = (rows as any[])[0]
    if (!admin) return null
    return {
      id: String(admin.id),
      email: admin.email,
      password: admin.password,
      name: admin.name,
      role: 'admin',
      createdAt: admin.createdAt
    }
  }
}

// Auto-init (dev convenience)
ensureAdminTable()
  .then(() => maybeSeedDefaultAdmin())
  .catch(err => console.error('Admin DB init failed:', err))

